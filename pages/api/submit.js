import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'path'
import { nanoid } from 'nanoid'

const file = join(process.cwd(), 'db', 'data.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  await db.read()
  db.data ||= { votes: [], reports: [] }

  const { kind } = req.body
  if (kind === 'vote') {
    db.data.votes.push({ id: nanoid(), ...req.body, ts: new Date().toISOString() })
    await db.write()
    res.json({ message: 'Vote berhasil disimpan!' })
  } else if (kind === 'report') {
    db.data.reports.push({ id: nanoid(), ...req.body, ts: new Date().toISOString() })
    await db.write()
    res.json({ message: 'Laporan berhasil dikirim!' })
  } else {
    res.status(400).json({ message: 'Jenis data tidak dikenal' })
  }
}