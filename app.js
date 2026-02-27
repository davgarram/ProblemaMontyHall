document.addEventListener('alpine:init', () => {
    Alpine.data('jugar', () => ({
        estado: undefined,
        puertas: undefined,
        seleccionada: undefined,
        ganado: false,
        elegir(puerta) {
            Alpine.raw(this.monty).elegir(puerta);
            this.actualizarUi();
        },

        cambiar(cambiar){
            Alpine.raw(this.monty).cambiar(cambiar);
            this.actualizarUi();
        },

        reset() {
            this.monty = new ProblemaMontyHall();
            this.actualizarUi();
        },

        actualizarUi(){
            this.estado=Alpine.raw(this.monty).estado;
            this.puertas=Alpine.raw(this.monty).estadoPuertas;
            this.seleccionada=Alpine.raw(this.monty).puertaConcursante;
            this.ganado=Alpine.raw(this.monty).haGanado;
        },
        clickPuerta(puerta){
            switch(this.estado){
                case  "eligiendo":
                    this.elegir(puerta);
                    break;
                case  "cambiando":
                    this.cambiar(puerta!=this.seleccionada);
                    break;
            }
        },
        encuesta(){
            const url = new URL('https://docs.google.com/forms/d/e/1FAIpQLSeQSGHDnNAOwjo2r3Z3qq14jN2UWHU70whyB35ONuqZ2zAJow/viewform');
            
            url.searchParams.set('usp', 'pp_url');
            url.searchParams.set('entry.617973885', `Puerta ${Alpine.raw(this.monty).puertaInicial}`);
            url.searchParams.set('entry.1318153726', Alpine.raw(this.monty).haCambiado?'Sí':'No');
            url.searchParams.set('entry.1612167640', Alpine.raw(this.monty).haGanado?'Sí':'No');

            window.open(url.href, '_blank');
        }
    }))

    Alpine.data('simular', () => ({
        simulaciones:0,
        victoriasNoCambiar:0,
        victoriasCambiar:0,
        gaugeData:null,
        myChart:null,
        init(){
            let chartDom = document.getElementById('main-chart');
            let myChart = echarts.init(chartDom);
            const gaugeData = [
            {
                value: 0,
                name: 'Cambia de puerta',
                title: {
                offsetCenter: ['0%', '-30%']
                },
                detail: {
                valueAnimation: true,
                offsetCenter: ['0%', '-20%']
                }
            },
            {
                value: 0,
                name: 'No cambia de puerta',
                title: {
                offsetCenter: ['0%', '0%']
                },
                detail: {
                valueAnimation: true,
                offsetCenter: ['0%', '10%']
                }
            }
            ];
            const option = {
            series: [
                {
                type: 'gauge',
                startAngle: 90,
                endAngle: -270,
                pointer: {
                    show: false
                },
                progress: {
                    show: true,
                    overlap: false,
                    roundCap: true,
                    clip: false,
                    itemStyle: {
                    borderWidth: 1,
                    borderColor: '#464646'
                    }
                },
                axisLine: {
                    lineStyle: {
                    width: 40
                    }
                },
                splitLine: {
                    show: false,
                    distance: 0,
                    length: 10
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false,
                    distance: 50
                },
                data: gaugeData,
                title: {
                    fontSize: 14
                },
                detail: {
                    width: 50,
                    height: 14,
                    fontSize: 14,
                    color: 'inherit',
                    borderColor: 'inherit',
                    borderRadius: 20,
                    borderWidth: 1,
                    formatter: '{value}%'
                }
                }
            ]
            };
            this.myChart=myChart;
            this.gaugeData=gaugeData;
            this.myChart.setOption(option);
            this.reset();
        },
        simular(num) {
            for(let i=0;i<num;i++){
                this.victoriasNoCambiar+= ProblemaMontyHall.partidaRapida(Math.ceil(Math.random() * 3), false);
                this.victoriasCambiar+= ProblemaMontyHall.partidaRapida(Math.ceil(Math.random() * 3), true);
                this.simulaciones++;
            }
            this.actualizarUi();
        },
        reset(){
            this.simulaciones = 0;
            this.victoriasNoCambiar = 0;
            this.victoriasCambiar = 0;
            this.actualizarUi();
        },
        actualizarUi(){
            if(this.simulaciones){
                this.gaugeData[0].value = 100*(this.victoriasCambiar / (this.simulaciones)).toFixed(2);
                this.gaugeData[1].value = 100*(this.victoriasNoCambiar / (this.simulaciones)).toFixed(2);
            }else{
                this.gaugeData[0].value = 0;
                this.gaugeData[1].value = 0;
            }
            Alpine.raw(this.myChart).setOption({
                series: [
                {
                    data: this.gaugeData,
                    pointer: {show: false}
                }
                ]
            });
        }
    }))

    Alpine.data('resultados', () => ({
        fuente:'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8iQsimlc7Z-2Wc5QgxbE88aQKBrtFWssJSf76k7YvdLnIzETF5sg-2IFClHBFQ4JxENVLhdYkBy77/pub?gid=556463383&single=true&output=csv',
        datos:undefined,
        myChart:undefined,
        myChart2:undefined,
        init(){
            let chartDom = document.getElementById('sun-chart');
            let myChart = echarts.init(chartDom);
            let chartDom2 = document.getElementById('sank-chart');
            let myChart2 = echarts.init(chartDom2);
            this.myChart=myChart;
            this.myChart2=myChart2;
            this.myChart.setOption({
                series: {
                    type: 'sunburst',
                    radius: [0, '90%'],
                    label: {
                    rotate: 'radial'
                    }
                }
            });
            this.myChart2.setOption({
                series: {
                type: 'sankey',
                layout: 'none',
                emphasis: {
                    focus: 'adjacency'
                },
            }
            });
            this.prepararDatos(); 
        },
        actualizarUi(){
            let resultados = Array(8).fill(0);
            this.datos.forEach(function (fila) {
                resultados[(fila[1]=="Sí"?4:0) + (fila[3]=="Sí"?2:0) + (fila[4]=="Sí"?1:0)]+=1;
            });
            let data = [{
                name: `Conoce el juego (${resultados[7]+resultados[6]+resultados[5]+resultados[4]})`,
                value: resultados[7]+resultados[6]+resultados[5]+resultados[4],
                children: [{
                    name: `Cambia (${resultados[7]+resultados[6]})`,
                    value: resultados[7]+resultados[6],
                    children: [{
                        name: `Gana (${resultados[7]})`,
                        value: resultados[7],
                    },{
                        name: `Pierde (${resultados[6]})`,
                        value: resultados[6],
                    }]
                },{
                    name: `No cambia (${resultados[5]+resultados[4]})`,
                    value: resultados[5]+resultados[4],
                    children: [{
                        name: `Gana (${resultados[5]})`,
                        value: resultados[5],
                    },{
                        name: `Pierde (${resultados[4]})`,
                        value: resultados[4],
                    }]
                }],
            },{
                name: `No conoce el juego (${resultados[3]+resultados[2]+resultados[1]+resultados[0]})`,
                value: resultados[3]+resultados[2]+resultados[1]+resultados[0],
                children: [{
                    name: `Cambia (${resultados[3]+resultados[2]})`,
                    value: resultados[3]+resultados[2],
                    children: [{
                        name: `Gana (${resultados[3]})`,
                        value: resultados[3],
                    },{
                        name: `Pierde (${resultados[2]})`,
                        value: resultados[2],
                    }]
                },{
                    name: `No cambia (${resultados[1]+resultados[0]})`,
                    value: resultados[1]+resultados[0],
                    children: [{
                        name: `Gana (${resultados[1]})`,
                        value: resultados[1],
                    },{
                        name: `Pierde (${resultados[0]})`,
                        value: resultados[0],
                    }]
                }],
            }];
            Alpine.raw(this.myChart).setOption({
                series: [
                {
                    data: data
                }
                ]
            });
            Alpine.raw(this.myChart2).setOption({
                series:{
                    data: [{name: 'Conoce el juego'},{name: 'No conoce el juego'},{name: 'Cambia'},{name: 'No cambia'},{name: 'Gana'},{name: 'Pierde'}],
                    links: [
                    {
                        source: 'Conoce el juego',
                        target: 'Cambia',
                        value: resultados[7]+resultados[6]
                    },
                    {
                        source: 'Conoce el juego',
                        target: 'No cambia',
                        value: resultados[5]+resultados[4]
                    },
                    {
                        source: 'No conoce el juego',
                        target: 'Cambia',
                        value: resultados[3]+resultados[2]
                    },
                    {
                        source: 'No conoce el juego',
                        target: 'No cambia',
                        value: resultados[1]+resultados[0]
                    },
                    {
                        source: 'Cambia',
                        target: 'Gana',
                        value: resultados[7]+resultados[3]
                    },
                    {
                        source: 'Cambia',
                        target: 'Pierde',
                        value: resultados[6]+resultados[2]
                    },
                    {
                        source: 'No cambia',
                        target: 'Gana',
                        value: resultados[5]+resultados[1]
                    },
                    {
                        source: 'No cambia',
                        target: 'Pierde',
                        value: resultados[4]+resultados[0]
                    }
                    ]
                }
            });
        },
        async prepararDatos(){
            const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vR8iQsimlc7Z-2Wc5QgxbE88aQKBrtFWssJSf76k7YvdLnIzETF5sg-2IFClHBFQ4JxENVLhdYkBy77/pub?gid=556463383&single=true&output=csv");
            const datos = await response.text();
            this.datos = datos.split('\r\n').slice(1).map(fila => fila.split(','));
            console.log(this.datos);
            this.actualizarUi();
        }
    }))
})