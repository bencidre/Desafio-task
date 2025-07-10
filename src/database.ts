import fs from 'node:fs/promises'
import path from 'node:path'

const dbPath = path.resolve('db.json')

export class Database {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #database: Record<string, any[]> = {}

  async init() {
    try {
      const data = await fs.readFile(dbPath, 'utf-8')
      this.#database = JSON.parse(data)
    } catch {
      await this.#persist()
    }
  }

  async #persist() {
    await fs.writeFile(dbPath, JSON.stringify(this.#database, null, 2))
  }

  async select(table: string, search?: Record<string, string>) {
    let data = this.#database[table] ?? []

    if (search && Object.keys(search).length > 0) {
      data = data.filter((row) =>
        Object.entries(search).some(([key, value]) => {
          return (
            typeof row[key] === 'string' &&
            row[key].toLowerCase().includes(value.toLowerCase())
          )
        }),
      )
    }

    return data
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async insert(table: string, data: any) {
    if (!this.#database[table]) this.#database[table] = []
    this.#database[table].push(data)
    await this.#persist()
    return data
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(table: string, id: string, data: any) {
    const rowIndex = this.#database[table]?.findIndex((r) => r.id === id)
    if (rowIndex >= 0) {
      this.#database[table][rowIndex] = {
        ...this.#database[table][rowIndex],
        ...data,
      }
      await this.#persist()
    }
  }

  async delete(table: string, id: string) {
    const rowIndex = this.#database[table]?.findIndex((r) => r.id === id)
    if (rowIndex >= 0) {
      this.#database[table].splice(rowIndex, 1)
      await this.#persist()
    }
  }
}
