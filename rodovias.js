const fs = require('fs')
const readline = require('readline')

const csv = require('csv-parser')

const results = []

let custoPorKM = 0

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

fs.createReadStream('DNIT-Distancias.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (data) => {
    results.push(data)
  })
  .on('end', () => {
    const menu = () => {
      console.log('1. Configurar custo por KM')
      console.log('2. Consultar trecho')
      console.log('3. Consultar rota')
      console.log('4. Terminar o programa\n')

      rl.question('Escolha um número: ', (numero) => {
        switch (numero) {
          case '1':
            rl.question('\nInforme o custo por KM rodado: ', (custo) => {
              const custoFloat = parseFloat(custo)

              if (custoFloat > 0) {
                custoPorKM = custoFloat

                console.log('\nCusto por KM rodado salvo com sucesso!\n')

                menu()
              } else {
                console.log('\nO custo por KM rodado deve ser positivo!\n')
                menu()
              }
            })

            break
          case '2':
            rl.question('Informe o nome da cidade de origem: ', (cidade) => {
              let cidadeOrigem = cidade

              rl.question('Informe o nome da cidade de destino: ', (cidade) => {
                let cidadeDestino = cidade

                consultarTrecho(cidadeOrigem, cidadeDestino, results)
                menu()
              })
            })

            break
          case '3':
            rl.question(
              'Informe o nome de duas ou mais cidades separadas por vírgula:',
              (cidades) => {
                let arrayDeCidades = cidades.split(', ')

                consultarRota(arrayDeCidades, results)
                menu()
              }
            )

            break
          case '4':
            rl.close()
            break
          default:
            console.log('Escolha uma opção válida\n')
            menu()
        }
      })
    }

    menu()
  })

const consultarTrecho = (cidade1, cidade2, tabela) => {
  const nomeCidadeOrigem = cidade1.toUpperCase()
  const nomeCidadeDestino = cidade2.toUpperCase()

  let cidadeEstaNaTabela = true
  let cidadeInexistente = ''

  let distanciaAteCidadeDeDestino = 0
  let custoTotalCalculado = 0

  for (let i = 0; i < tabela.length; i++) {
    if (!tabela[i][nomeCidadeOrigem] || !tabela[i][nomeCidadeDestino]) {
      cidadeEstaNaTabela = false

      if (tabela[i][nomeCidadeOrigem]) {
        cidadeInexistente = cidade2
      } else {
        cidadeInexistente = cidade1
      }

      break
    }

    if (custoPorKM) {
      if (tabela[i][nomeCidadeOrigem] == 0) {
        distanciaAteCidadeDeDestino = tabela[i][nomeCidadeDestino]

        custoTotalCalculado = distanciaAteCidadeDeDestino * custoPorKM

        console.log(
          `Viagem: ${cidade1} -> ${cidade2} (${distanciaAteCidadeDeDestino} KM)\nCusto: R$ ${custoTotalCalculado}\n`
        )
      }
    } else {
      console.log(
        'Você não digitou o custo por KM.\nDigite e tente novamente!\n'
      )
      break
    }
  }

  if (!cidadeEstaNaTabela) {
    console.log(
      'A cidade ',
      cidadeInexistente,
      ' não existe na tabela. \nTente digitar novamente!\n'
    )
  }
}

const consultarRota = (cidades, tabela) => {
  let cidadeEstaNaTabela = true
  let cidadeInexistente = ''

  let cidadeAtual = ''
  let proximaCidade = ''
  let distanciaAteProximaCidade = 0
  let distanciaTotal = 0
  let custoViagem = 0
  let litrosGasolinaConsumidos = 0
  let diasParaFinalizarViagem = 0

  for (let i = 0; i < tabela.length; i++) {
    for (let y = 0; y < cidades.length; y++) {
      cidadeAtual = cidades[y].toUpperCase()

      if (!tabela[i][cidadeAtual]) {
        cidadeEstaNaTabela = false

        cidadeInexistente = cidades[y]
      }
    }
  }

  if (cidadeEstaNaTabela && custoPorKM) {
    for (let i = 0; i < tabela.length; i++) {
      for (let y = 0; y < cidades.length; y++) {
        cidadeAtual = cidades[y].toUpperCase()

        if (tabela[i][cidadeAtual] == 0) {
          if (cidades[y + 1]) {
            proximaCidade = cidades[y + 1].toUpperCase()

            distanciaAteProximaCidade = tabela[i][proximaCidade]

            distanciaTotal += parseFloat(distanciaAteProximaCidade)

            console.log(
              `Trecho da viagem: ${cidades[y]} -> ${
                cidades[y + 1]
              } (${distanciaAteProximaCidade} KM)`
            )
          }
        }
      }
    }

    custoViagem = distanciaTotal * custoPorKM
    litrosGasolinaConsumidos = 2.57 * distanciaTotal
    diasParaFinalizarViagem = distanciaTotal / 283

    console.log(
      `O custo total da viagem será de R$ ${custoViagem}.\nOs litros de gasolina consumidos para realizar a viagem foram ${litrosGasolinaConsumidos} L.\nO número de dias para realizar a viagem é de ${parseInt(
        diasParaFinalizarViagem
      )} dias.\n`
    )
  } else {
    if (!cidadeEstaNaTabela) {
      console.log(
        'A cidade ',
        cidadeInexistente,
        ' não existe na tabela.\nTente digitar novamente!\n'
      )
    } else {
      console.log(
        'Você não digitou o custo por KM.\nDigite e tente novamente!\n'
      )
    }
  }
}
