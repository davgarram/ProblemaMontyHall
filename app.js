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
            var chartDom = document.getElementById('main-chart');
            var myChart = echarts.init(chartDom);
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
})