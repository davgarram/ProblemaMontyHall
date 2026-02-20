class ProblemaMontyHall {
    static estados = [
        "eligiendo",
        "cambiando",
        "terminado",
    ];
    #puertaCoche = 0; //La puerta tras la que está el coche (1-3)
    #estado = "eligiendo";
    #puertaConcursante = 0; //La puerta elegida por el concursante
    #puertaAbierta = 0; //La puerta abierta por el presentador
    constructor() {
        this.#puertaCoche = Math.ceil(Math.random() * 3); //Se coloca el coche tras una puerta con probabilidad uniforme (pseudoaleatorio)
    }
    //Devuelve falso si no se puede elegir, verdadero en caso de éxito
    elegir(puerta){
        if(this.#estado != "eligiendo" || puerta>3 || puerta<1){
            return false;
        }
        this.#puertaConcursante = puerta;
        //Las tres puertas siempre suman 6. Abrimos la que no es ni la actual ni la del coche.
        this.#puertaAbierta = (this.#puertaCoche==this.#puertaConcursante)? ((this.#puertaConcursante-1+Math.sign(Math.random()-0.5))%3)+1 : 6 - (this.#puertaConcursante + this.#puertaCoche);
        this.#estado = "cambiando";
        return true;
    }
    //Devuelve falso si no se puede cambiar, verdadero en caso de éxito
    cambiar(cambiar){
        if(this.#estado != "cambiando"){
            return false;
        }
        if(cambiar){
            //Las tres puertas siempre suman 6. Cambiamos a la que no es ni la actual ni la abierta.
            this.#puertaConcursante = 6 - (this.#puertaConcursante + this.#puertaAbierta);
        }
        this.#estado = "terminado";
        return true;
    }
    //Estado
    get estado(){
        return this.#estado;
    }
    //Número de la puerta abierta por el presentador (0 si ninguna)
    get puertaAbierta(){
        return this.#puertaAbierta;
    }

    get puertaConcursante(){
        return this.#puertaConcursante;
    }
    //Devuelve falso si no se ha terminado o se ha perdido. Verdadero si ha ganado 
    get haGanado(){
        return this.#estado=="terminado"? this.#puertaCoche==this.#puertaConcursante : false;
    }
    //Devuelve 0 si no se ha terminado. Puerta con el coche si se ha terminado 
    get puertaCoche(){
        return this.#estado=="terminado"? this.#puertaCoche : 0;
    }
    //Array con el estado de las puertas, "cerrada", "cabra", "coche",
    get estadoPuertas(){
        let estadoPuertas = Array(3).fill("cerrada");
        if(this.puertaAbierta){
            estadoPuertas[this.puertaAbierta-1]="cabra";
        }
        if(this.puertaCoche){
            estadoPuertas[this.puertaCoche-1]="coche";
        }
        return estadoPuertas;
    }

    //Devuelve true en caso de victoria
    static partidaRapida(puertaInicial, cambiar){
        const puertaCoche = Math.ceil(Math.random() * 3);
        //return cambiar? puertaCoche!=puertaInicial:puertaCoche==puertaInicial; //Version ultra rapida, no simulada del todo
        let puerta = puertaInicial;
        const puertaAbierta = (puertaCoche==puerta)? ((puerta-1+Math.sign(Math.random()-0.5))%3)+1 : 6 - (puerta + puertaCoche);
        if(cambiar){
            puerta = 6 - (puerta + puertaAbierta);
        }
        return puertaCoche==puerta;
    }
}