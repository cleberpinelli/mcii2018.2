const fs = require('fs');
const readline = require('readline');
const _ = require('lodash');

// Caso queira gerar para outro arquivo com a mesma formatacao.
// alterar o caminho do arquivo na funcao abaixo.
let file = fs.createReadStream("../data/saida mq faure.txt");

console.log("inicializando leitura do arquivo");
const reader = readline.createInterface({
    input: file
});

const formataLinha = function(obj){
    return `${obj.tipoGerador};${obj.nomeInstancia};${obj.numeroCiclo};${obj.tempoExecucao};${obj.valor};${obj.restarts};${obj.melhorRestart}\r\n`;
}

const criarArquivo = function(dados){
    _.forEach(dados, (obj)=>{
        let arquivo = `./dados/${obj.tipo}_${new Date().getTime()}`;
        let writeStream = fs.createWriteStream(arquivo);
        console.log(`Criando arquivo ${arquivo}`);
        writeStream.write(`tipogerador;nomeinstancia;numerociclo;tempoexecucao;valor;restarts;melhorrestart\r\n`);
        _.forEach(obj.value,(T)=>{
            writeStream.write(formataLinha(T));
        });
    })
}

var promise = new Promise(function (resolve, reject) {
    let objetos = [];
    reader.on("line", (line) => {
        let linhaSplit = _.chain(line).split(";").value();
        let obj = {
            tipoGerador: _.trim(linhaSplit[0]),
            nomeInstancia: _.trim(linhaSplit[1].split("#")[0]),
            numeroCiclo: _.trim(linhaSplit[1].split("#")[1]),
            tempoExecucao: _.trim(linhaSplit[2]),
            valor: _.trim(linhaSplit[3]),
            restarts: _.trim(linhaSplit[4]),
            melhorRestart: _.trim(linhaSplit[5])
        }
        objetos.push(obj);
    }).on("close", () => {
        resolve(objetos);
    }).on("error", (e) => {
        console.error(e);
        reject(e);
    });
});

promise.then((resultado) => {
    const nomeIntancias = _.uniq(_.map(resultado, 'nomeInstancia'));
    console.log(`Encontrado instancias do tipo ${JSON.stringify(nomeIntancias)}`);
    let porTipo = _.chain(nomeIntancias).map((tipo) => {
        return {
            tipo: tipo,
            value: _.chain(resultado).filter((obj) => { return obj.nomeInstancia.includes(tipo) }).value()
        }
    }).value();
    console.log(`Inicializando a criação do arquivo`);
    criarArquivo(porTipo);
    return porTipo;
});