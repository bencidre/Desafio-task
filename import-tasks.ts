// import-tasks.ts
import { parse } from 'csv-parse'
import fetch from 'node-fetch' // se necessário: npm install node-fetch@2
import fs from 'node:fs'
import path from 'node:path'

const csvPath = path.resolve(__dirname, 'tasks.csv') // ajuste o caminho se necessário

const stream = fs.createReadStream(csvPath)

const csvParse = parse({
  delimiter: ',',
  skipEmptyLines: true,
  fromLine: 2, // pula o cabeçalho
})

async function run() {
  const linesParse = stream.pipe(csvParse)
  let count = 0

  for await (const line of linesParse) {
    const [title, description] = line

    const response = await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    })

    if (response.ok) {
      console.log(`✅ Importado: ${title}`)
      count++
    } else {
      console.error(
        `❌ Falha ao importar: ${title} - Status ${response.status}`,
      )
    }

    // await wait(500); // se quiser importação lenta para debugar
  }

  console.log(`\n🚀 Importação concluída: ${count} tarefas importadas.`)
}

run().catch((err) => {
  console.error('Erro na importação:', err)
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
