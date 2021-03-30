//Importação de módulos do node.js necessários para leitura de arquivo e criação de interface com usuário
const fs = require('fs')
const readline = require('readline')

//Importação de biblioteca que manipula dados csv (para converter os dados em uma array, podendo extrair valores necessários)
const csv = require('csv-parser')

//Variável para armazenar o array criado pelo csv-parser
const results = []

//Criação de variável global para armazenar o custo por Km digitado pelo usuário
let custoPorKM = 0

//Criando interface para interação com o usuário
//    - Input: determina por onde os dados vão entrar, nesse caso, entrarão pelo terminal de comando
//    - Output: determina por onde os dados vão sair, é o que mostra as perguntas para o usuário, e nesse caso também acontece pelo terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

//Tranformando o arquivo csv em um array possível de manipular
fs.createReadStream('DNIT-Distancias.csv')
  // O que estiver separado por ";" na primeira linha do arquivo csv, se torna um atributo para os valores das outras linhas
  .pipe(csv({ separator: ';' }))
  .on('data', (data) => {
    // Aqui utilizei o método push para adicionar no array results já criado, os dados manipulados pela biblioteca
    results.push(data)
  })
  // Depois que o programa acabar de transformar os dados, ele vai executar a callback no parâmetro, dentro dessa callback, coloquei a função menu
  .on('end', () => {
    //Função para criar menu para o usuário
    const menu = () => {
      // Criação do menu de opções
      console.log('1. Configurar custo por KM')
      console.log('2. Consultar trecho')
      console.log('3. Consultar rota')
      console.log('4. Terminar o programa\n')

      //Perguntando ao usuário qual opção que ele deseja a partir da interface criada
      rl.question('Escolha um número: ', (numero) => {
        //Escolhendo ações para fazer dependendo do número que o usuário digitar
        //  - O parâmetro número dessa função vem como string, então, ao pedir para o programa escolher, é necessário que ele compare o número recebido com uma string desse mesmo número
        //  - Dentro desse menu, chamarei diversas funções para implementar o que foi pedido no enunciado
        switch (numero) {
          case '1':
            // Pedindo para o usuário informar o custo
            rl.question('\nInforme o custo por KM rodado: ', (custo) => {
              // Tranformando a string 'custo' recebida no terminal em um número quebrado (float)
              const custoFloat = parseFloat(custo)

              //Validando se o custo é positivo
              if (custoFloat > 0) {
                //Atribuindo o valor do custo digitado pelo usuário para a variável global de custo (para o custo ficar salvo para o programa inteiro)
                custoPorKM = custoFloat

                //Informando o usuário que o custo foi salvo com sucesso
                console.log('\nCusto por KM rodado salvo com sucesso!\n')

                //Chamando o menu novamente para o programa continuar rodando (TODAS as vezes que o menu é chamado dentro do switch é com esta intenção)
                menu()
              } else {
                //Informando ao usuário o critério para o custo ser aceito
                console.log('\nO custo por KM rodado deve ser positivo!\n')
                menu()
              }
            })

            //O break serve para quebrar o fluxo do código quando o usuário já escolheu uma opção (Em todas as vezes que ele é chamado no código é para isso)
            break
          case '2':
            //Perguntando ao usuário qual a cidade de origem do trecho que ele quer pesquisar
            rl.question('Informe o nome da cidade de origem: ', (cidade) => {
              // Atribuindo a string cidade recebida no terminal para variável cidadeOrigem (mantém o valor guardado)
              let cidadeOrigem = cidade

              //Perguntando ao usuário qual a cidade de destino do trecho que ele quer pesquisar
              rl.question('Informe o nome da cidade de destino: ', (cidade) => {
                // Atribuindo a string cidade recebida no terminal para variável cidadeDestino (mantém o valor guardado)
                let cidadeDestino = cidade

                //Depois que as duas cidades foram digitadas chamamos a função consultarTrecho() que calcula a distância entre elas,
                // passando como parâmetro as variáveis com os nomes das cidades e os dados do arquivo csv que estão armazenados na variável results
                consultarTrecho(cidadeOrigem, cidadeDestino, results)
                menu()
              })
            })

            break
          case '3':
            //Perguntando ao usuário as cidades da rota que ele deseja calcular
            rl.question(
              'Informe o nome de duas ou mais cidades separadas por vírgula:',
              (cidades) => {
                //Pegando essa string recebida como parâmetro e a transformando em um array com as cidades digitadas
                //com o método split, que separa onde tem o caractere passado como parâmetro
                let arrayDeCidades = cidades.split(', ')

                // Chamando a função consltarRota() e passando como parâmetro o array das cidades e
                //os dados do arquivo csv que estão armazenados na variável results
                consultarRota(arrayDeCidades, results)
                menu()
              }
            )

            break
          case '4':
            //Caso o usuário escolha a opção de terminar o programa, fechamos a interface com o comando abaixo
            rl.close()
            break
          default:
            //Se o usuário não digitar nenhuma das opções do menu, informamos que a opção digitada é inválida e mostramos o menu de novo
            console.log('Escolha uma opção válida\n')
            menu()
        }
      })
    }

    //Aqui a função menu está sendo chamada fora do switch para mostrar o menu na primeira execução do programa
    menu()
  })

//Função utilizada para calcular um trecho de rota entre duas cidades
const consultarTrecho = (cidade1, cidade2, tabela) => {
  //Transformando o nome das cidades para letra maiúcula para conseguir comparar na tabela
  const nomeCidadeOrigem = cidade1.toUpperCase()
  const nomeCidadeDestino = cidade2.toUpperCase()

  //Criação de variáveis para controle dentro da função
  let cidadeEstaNaTabela = true
  let cidadeInexistente = ''

  //Criação de variáveis para armazenar valores necessários na função
  let distanciaAteCidadeDeDestino = 0
  let custoTotalCalculado = 0

  // Esse for percorre o array com os dados vindos do arquivo csv
  for (let i = 0; i < tabela.length; i++) {
    // Esse if serve para verificar se as duas cidades digitadas se encontram na tabela, caso elas não estejam o programa já para aqui (devido ao break no final do if)
    if (!tabela[i][nomeCidadeOrigem] || !tabela[i][nomeCidadeDestino]) {
      // Caso alguma das cidades não estiver na tabela, a variável abaixo recebe false
      cidadeEstaNaTabela = false

      // Com esse if estamos pegando o nome da cidade que não está na tabela, para informar ao usuário qual nome ele digitou errado
      if (tabela[i][nomeCidadeOrigem]) {
        cidadeInexistente = cidade2
      } else {
        cidadeInexistente = cidade1
      }

      break
    }

    // Esse if confere se o custo por KM é diferente de zero (0 no if torna a condição falsa), se for, ele faz os cálculos com o custo digitado
    // se não for, ele pede ao usuário que digite um valor para o custo (o usuário vai receber de novo as opções do menu para conseguir digitar o custo)
    if (custoPorKM) {
      // Como os dados de comparação vem de uma tabela que foi transformada em um array, e esse array tem cada uma das linhas da tabela como sendo um objeto dentro dele com as cidades e as distâncias,
      // se uma cidade da tabela tem 0 de distância em relação à outra é pq essa cidade da tabela é a que está no atributo nomeCidadeOrigem (Só terá 0 de distância se for ela mesma)
      if (tabela[i][nomeCidadeOrigem] == 0) {
        // Como já validei que estou na posição do array com as ditâncias da cidade de origem para as demais cidades, agora basta pegar a ditância até a cidade de destino dessa posição do array
        distanciaAteCidadeDeDestino = tabela[i][nomeCidadeDestino]

        //Essa linha calcula o custo total multiplicando a distância pelo custo por KM
        custoTotalCalculado = distanciaAteCidadeDeDestino * custoPorKM

        //Essa linha printa para o usuário as informações pedidas
        console.log(
          `Viagem: ${cidade1} -> ${cidade2} (${distanciaAteCidadeDeDestino} KM)\nCusto: R$ ${custoTotalCalculado}\n`
        )
      }
    } else {
      //Se entrar nesse else é pq o usuário ainda não informou o custo por KM, então o programa pede para ele informar
      console.log(
        'Você não digitou o custo por KM.\nDigite e tente novamente!\n'
      )
      break
    }
  }

  // Este if está aqui para printar para o usuário que o nome da cidade digitado
  // não existe na tabela e mostra também qual é esse nome
  if (!cidadeEstaNaTabela) {
    console.log(
      'A cidade ',
      cidadeInexistente,
      ' não existe na tabela. \nTente digitar novamente!\n'
    )
  }
}

//Função para calcular rota entre duas ou mais cidades (recebe um array de cidades como parâmetro)
const consultarRota = (cidades, tabela) => {
  //Criação de variáveis para controle dentro da função
  let cidadeEstaNaTabela = true
  let cidadeInexistente = ''

  //Criação de variáveis para armazenar valores necessários na função
  let cidadeAtual = ''
  let proximaCidade = ''
  let distanciaAteProximaCidade = 0
  let distanciaTotal = 0
  let custoViagem = 0
  let litrosGasolinaConsumidos = 0
  let diasParaFinalizarViagem = 0

  // for que percorre o array com os dados vindos do arquivo csv (esse for serve para fazer
  //a validação se as cidades digitadas realmente estão nos dados do arquivo csv)
  for (let i = 0; i < tabela.length; i++) {
    // for que percorre o array com as cidades passadas
    for (let y = 0; y < cidades.length; y++) {
      //Transformando a cidade que está passando no loop para letra maiúscula para conseguir
      //fazer a validação (nos dados as cidades estão em letra maiúscula), e armazenando o valor em variável
      cidadeAtual = cidades[y].toUpperCase()

      //Pegando os dados das cidades e vendo se possui algum valor quando colocado cidadeAtual como  atributo
      // Se não existir nada como valor em alguma iteração do for, entra no if
      if (!tabela[i][cidadeAtual]) {
        // Atribuindo false para vaiável para dizer que o atributo cidadeAtual não está na tabela
        cidadeEstaNaTabela = false

        // Armazenando o nome da cidade que não está na tabela em variável para mostrar ao usuário
        cidadeInexistente = cidades[y]
      }
    }
  }

  //Entra nesse if se o valor de cidadeEstaNaTabela for true (começa setado como true e pode ser
  // mudado no if acima) E se possuir um custoPorKM diferente de zero, ou seja, se as duas condições forem verdadeiras
  if (cidadeEstaNaTabela && custoPorKM) {
    // Os dois "for" percorrem a mesma coisa que o for acima, porém com objetivo de fazer os cálculos necessários
    for (let i = 0; i < tabela.length; i++) {
      for (let y = 0; y < cidades.length; y++) {
        // Transformando a cidade atual para letra maiúscula
        cidadeAtual = cidades[y].toUpperCase()

        //Com esse if vamos entrar na posição do array de dados onde tem as distâncias da cidadeAtual para o resto das cidades
        if (tabela[i][cidadeAtual] == 0) {
          // Com esse if estamos conferindo se existe uma próxima cidade (depois da que estamos)
          if (cidades[y + 1]) {
            //Transformando o nome da próxima cidade para letra maiúscula
            proximaCidade = cidades[y + 1].toUpperCase()

            //Atribuindo o valor da distância até a próxima cidade para uma variável
            distanciaAteProximaCidade = tabela[i][proximaCidade]

            //Utilizando uma varável para acumular o valor de todas as distâncias que passarem aqui
            //(utilizei o parseFloat pois o valor de distanciaAteProximaCidade vem como string dos dados)
            distanciaTotal += parseFloat(distanciaAteProximaCidade)

            //Informando ao usuário qual o trecho calculado e a distância desse trecho
            console.log(
              `Trecho da viagem: ${cidades[y]} -> ${
                cidades[y + 1]
              } (${distanciaAteProximaCidade} KM)`
            )
          }
        }
      }
    }

    //Calculando o custo total, os litros de gasolina e os dias para finalizar a viagem a partir dos dados passados no enunciado
    // Esses cálculos podem ser feitos fora do for, pois precisam da distancia total acumulada e não dos valores a cada iteração
    custoViagem = distanciaTotal * custoPorKM
    litrosGasolinaConsumidos = 2.57 * distanciaTotal
    diasParaFinalizarViagem = distanciaTotal / 283

    //Printando as informações calculadas para o usuário
    console.log(
      `O custo total da viagem será de R$ ${custoViagem}.\nOs litros de gasolina consumidos para realizar a viagem foram ${litrosGasolinaConsumidos} L.\nO número de dias para realizar a viagem é de ${parseInt(
        diasParaFinalizarViagem
      )} dias.\n`
    )
  } else {
    //Entra nesse if se alguma das cidades digitadas não existir nos dados e mostra qual é essa cidade para o usuário
    if (!cidadeEstaNaTabela) {
      console.log(
        'A cidade ',
        cidadeInexistente,
        ' não existe na tabela.\nTente digitar novamente!\n'
      )
    } else {
      //Entra aqui caso o custo for 0, isto é, não foi digitado pelo usuário
      console.log(
        'Você não digitou o custo por KM.\nDigite e tente novamente!\n'
      )
    }
  }
}
