const fs = require('fs');
const readline = require('readline');
const _ = require('lodash');

let file = fs.createReadStream("../data/saida mq faure.txt");

const reader = readline.createInterface({
    input: file
});

const formataLinha = function(obj){
    return `${obj.tipoGerador};${obj.nomeInstancia};${obj.numeroCiclo};${obj.tempoExecucao};${obj.valor};${obj.restarts};${obj.melhorRestart}`;
}

const criarArquivo = function(dados){
    _.forEach(dados, (obj)=>{

        let nomeArquivo = obj.tipo;
        fs.createWriteStream(`./dados/${nomeArquivo}_${new Date().getTime()}`);
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
        console.log("error", e);
        reject(e);
    });
});

promise.then((resultado) => {
    const nomeIntancias = _.uniq(_.map(resultado, 'nomeInstancia'));
    let porTipo = _.chain(nomeIntancias).map((tipo) => {
        return {
            tipo: tipo,
            value: _.chain(resultado).filter((obj) => { return obj.nomeInstancia.includes(tipo) }).value()
        }
    }).value();
    criarArquivo(porTipo);
    return porTipo;
});