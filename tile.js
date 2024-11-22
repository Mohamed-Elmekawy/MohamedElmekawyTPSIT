const canvas = document.getElementById('scacchiera');
const ctx = canvas.getContext('2d');
const squareSize = 100;
const w = 400;
const h = 400;

var indietroMosse=[]

var posLibero={
    x: 301,
    y: 301
}
var pezzi = [  
    { x: 1, y: 301, src: 'pedone.png', img: null , nome: "p"},
    { x: 101, y: 301, src: 'pedone.png', img: null , nome: "p" }, 
    { x: 201, y: 301, src: 'pedone.png', img: null , nome: "p" },

    { x: 1, y: 201, src: 'alfiere.jpg', img: null , nome: "a" },  
    { x: 101, y: 201, src: 'alfiere.jpg', img: null , nome: "a" }, 
    { x: 201, y: 201, src: 'alfiere.jpg', img: null , nome: "a" },
    { x: 301, y: 201,  src: 'pedone.png', img: null , nome: "p" },
      
    { x: 1, y: 101, src: 'cavallo.png', img: null , nome: "c" }, 
    { x: 101, y: 101, src: 'cavallo.png', img: null , nome: "c" }, 
    { x: 201, y: 101, src: 'cavallo.png', img: null , nome: "c" },
    { x: 301, y: 101, src: 'cavallo.png', img: null , nome: "c" },  

    { x: 101, y: 1, src: 'pedone.png', img: null , nome: "p" }, 
    { x: 201, y: 1, src: 'pedone.png', img: null , nome: "p"},
    { x: 301, y: 1, src: 'pedone.png', img: null , nome: "p"},


    { x: 1, y: 1, src: 'torre.png', img: null, nome: "t" },
    { x: 301, y: 301, src: '', nome: "", } // Posizione vuota per indicare una casella senza pezzo
];

// Carica tutte le immagini e richiama show quando sono pronte
let imagesLoaded = 0;
pezzi.forEach(pezzo => {
    if (pezzo.src) { 
        const img = new Image();
        img.src = pezzo.src;
        img.onload = () => {
            pezzo.img = img;  
            imagesLoaded++;
            if (imagesLoaded === pezzi.length - 1) {
                scacchiera();
            }
        };
    }
});

const scacchiera = () => {
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            ctx.fillStyle = 'white';
            ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
    }

    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(3 * squareSize, 3 * squareSize, squareSize, squareSize);
    
    pezzi.forEach(pezzo => {
        if (pezzo.img) {  
            ctx.drawImage(pezzo.img, pezzo.x, pezzo.y, 98, 99);
        }
    });

};

const check = (mx, my, x, y) => {
    return mx >= x && mx <= x + 100 && my >= y && my <= y + 100 && y > 0;
};

// Funzione per gestire il click sul canvas


contMosse=document.getElementById('mosse');
var cont=0;


canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    pezzi.forEach((pezzo) => {
        var pezzoSpostato=false;
        if (check(mouseX, mouseY, pezzo.x, pezzo.y)) {

            const scambio=()=>{
                const tempX = pezzo.x;
                const tempY = pezzo.y;
                pezzo.x = posLibero.x;
                pezzo.y = posLibero.y;
                posLibero.x = tempX;
                posLibero.y = tempY;
                pezzoSpostato=true;

                if(pezzoSpostato)
                {
                    cont++;
                    contMosse.innerHTML = "Mosse " + cont;
                }

            }
            
            if (pezzo.nome === 'p'){

                if (posLibero.x === pezzo.x && posLibero.y === pezzo.y-100) {
                    // Scambia le coordinate x e y tra i due pezzi
                    scambio();
                }

             }

            if (pezzo.nome === 'a' ) {
                const mosseAlfiere = [
                    { x: pezzo.x - 100, y: pezzo.y - 100 }, // Diagonale alto-sinistra
                    { x: pezzo.x + 100, y: pezzo.y - 100 }, // Diagonale alto-destra
                    { x: pezzo.x - 100, y: pezzo.y + 100 }, // Diagonale basso-sinistra
                    { x: pezzo.x + 100, y: pezzo.y + 100 }  // Diagonale basso-destra

                   
                ];
                
                // Trova una casella vuota tra le mosse dell'alfiere
                for (const posizione of mosseAlfiere) {
                    // Confronta la posizione libera con la posizione corrente del cavallo
                    if (posLibero.x === posizione.x && posLibero.y === posizione.y) {
                        // Scambia le coordinate x e y tra i due pezzi
                        scambio();
                        break; // Interrompe il loop una volta trovato un movimento valido
                    }
                }
                
               
            }

            if (pezzo.nome === 'c') {
                const mosseCavallo = [
                    {x:pezzo.x-100, y:pezzo.y-200},
                    {x:pezzo.x+100, y:pezzo.y-200},
                    {x:pezzo.x-100, y:pezzo.y+200},
                    {x:pezzo.x+100, y:pezzo.y+200},
                    {x:pezzo.x+200, y:pezzo.y-100},
                    {x:pezzo.x+200, y:pezzo.y+100},
                    {x:pezzo.x-200, y:pezzo.y-100},
                    {x:pezzo.x-200, y:pezzo.y+100}

                ];
            
                // Trova una casella vuota tra le mosse del cavallo
                for (const posizione of mosseCavallo) {
                    // Confronta la posizione libera con la posizione corrente del cavallo
                    if (posLibero.x === posizione.x && posLibero.y === posizione.y) {
                        // Scambia le coordinate x e y tra i due pezzi
                        scambio();   
                        break; // Interrompe il loop una volta trovato un movimento valido
                    }
                }
             
            }
        
            if (pezzo.nome === 't') {

                const mosseTorre = [
                    { x: pezzo.x - 100, y: pezzo.y }, // Sinistra
                    { x: pezzo.x + 100, y: pezzo.y }, // Destra
                    { x: pezzo.x, y: pezzo.y - 100 }, // Sopra
                    { x: pezzo.x, y: pezzo.y + 100 }  // Sotto
                ];
                
                // Trova una casella vuota tra le mosse della torre
                for (const posizione of mosseTorre) {
                    // Confronta la posizione libera con la posizione corrente della torre
                    if (posLibero.x === posizione.x && posLibero.y === posizione.y) {
                        // Scambia le coordinate x e y tra i due pezzi
                        scambio();
                        break; // Interrompe il loop una volta trovato un movimento valido
                    }
                }
        
            }
            var array=[]
            if( pezzoSpostato){
                array.push(pezzo.x);
                array.push(pezzo.y);
                indietroMosse.push(array)
                pezzoSpostato=false
                console.log(indietroMosse)
            }          
            
            scacchiera(); 
        }
    });
});


const indietro=()=>{
    if(indietroMosse.length>0){
        cont++;
        contMosse.innerHTML = "Mosse " + cont;  
    }

    

    const ultima =indietroMosse[indietroMosse.length-1];
    const [ultimaX, ultimaY] = ultima;
    pezzi.forEach((pezzo)=>{
        if((pezzo.x==ultimaX) && (pezzo.y==ultimaY)){
           
            const tempX = pezzo.x;
            const tempY = pezzo.y;
            pezzo.x = posLibero.x;
            pezzo.y = posLibero.y;
            posLibero.x = tempX;
            posLibero.y = tempY;
            indietroMosse.pop();
            console.log("ciao")

        }
        scacchiera(); 
    });  
}

const timer = () => {
    let tempo = document.getElementById('tempo');
    let secondi = 0;  // inizializzazione della variabile secondi
    let minuti = 0;   // inizializzazione della variabile minuti
    let ore = 0;

    const inizio = setInterval(() => {
        secondi++;

        // Calcolo dei minuti e dei secondi
        if (secondi === 60) {
            secondi = 0;
            minuti++;
        }
        if (minuti === 60) {
            minuti = 0;
            ore++;
        }

        // Visualizzazione del tempo in formato MM:SS
        tempo.innerHTML = "Tempo: " + String(minuti).padStart(2, '0') + "min " + String(secondi).padStart(2, '0')+"sec";
        
        // Condizione per terminare il gioco e aggiornare il tempo
        if (pezzi[14].x == 301 && pezzi[14].y == 301) {
            clearInterval(inizio); // Ferma il timer
            tempo.innerHTML = "Hai completato il gioco in Tempo: " + String(minuti).padStart(2, '0') + "min " + String(secondi).padStart(2, '0')+"sec";
            
        }

    }, 1000);  // Aggiorna ogni secondo (1000 millisecondi)
};







scacchiera();
