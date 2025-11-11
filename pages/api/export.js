import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'path'
import ExcelJS from 'exceljs'

const file = join(process.cwd(), 'db', 'data.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

export default async function handler(req, res) {
  await db.read()
  db.data ||= { votes: [], reports: [] }

  const workbook = new ExcelJS.Workbook()

  const votesSheet = workbook.addWorksheet('Votes')
  votesSheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Vote', key: 'vote' },
    { header: 'Timestamp', key: 'ts' }
  ]
  db.data.votes.forEach(v => votesSheet.addRow(v))

  const reportsSheet = workbook.addWorksheet('Reports')
  reportsSheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Title', key: 'title' },
    { header: 'Description', key: 'desc' },
    { header: 'Location', key: 'location' },
    { header: 'Timestamp', key: 'ts' }
  ]
  db.data.reports.forEach(r => reportsSheet.addRow(r))

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename="data_voting_pengaduan.xlsx"')
  await workbook.xlsx.write(res)
  res.end()
}