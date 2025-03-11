const pino = require('pino')
const fs = require('fs')
const { join } = require('path')
const rfs = require('rotating-file-stream')
const axios = require('axios')
const FormData = require('form-data')
const { format } = require('util')
const AdmZip = require('adm-zip')
const { log_path } = require('./const')
const { getBaseURL, getUser } = require('./api')
const { registryReady } = require('./hook')
const { registeIPCHandle } = require('./ipc')
const { shell } = require('electron')

const levels = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
}

let maxFiles = 7
let size = '10M'
let interval = '1d'
let level = levels.WARN
let loggerPath = log_path

const originalError = console.error
const originalWarn = console.warn
const originalInfo = console.info
const originalLog = console.log

let logger = null

console.error = function (...args) {
  const msg = format(...args)
  originalError.apply(console, ['[ERROR] ' + msg])
  if (logger) logger.error(msg);
}

console.warn = function (...args) {
  const msg = format(...args)
  originalWarn.apply(console, ['[WARN] ' + msg])
  if (logger) logger.warn(msg);
}

console.info = function (...args) {
  const msg = format(...args)
  originalInfo.apply(console, ['[INFO] ' + msg])
  if (logger) logger.info(msg);
}

console.log = function (...args) {
  const msg = format(...args)
  originalLog.apply(console, ['[DEBUG] ' + msg])
  if (logger) logger.debug(msg);
}

var streams = [
  rfs.createStream('system.log', {
    size: size,
    interval: interval,
    compress: 'gzip',
    path: loggerPath,
  }),
]

const cleanOldLogs = () => {
  try {
    const files = fs.readdirSync(loggerPath).filter(file => file.endsWith('.log.gz'))
    const filesCount = files.length
    if (filesCount > maxFiles) {
      files.sort((a, b) => fs.statSync(join(loggerPath, a)).mtime - fs.statSync(join(loggerPath, b)).mtime)
      for (let i = 0; i < filesCount - maxFiles; i++) {
        const fileToDelete = join(loggerPath, files[i])
        fs.unlinkSync(fileToDelete)
      }
    }
  } catch (err) {
    originalError.apply(console, ['[ORIGINAL ERROR]' + err])
  }
}

const open = () => {
  return shell.openPath(loggerPath)
}

const upload = () => {
  return new Promise(async (resolve, reject) => {
    let zipPath = null
    try {
      // 压缩文件
      const fileNames = fs.readdirSync(loggerPath).filter(name => name.includes('.log'))
      if (fileNames.length === 0) {
        throw new Error('暂无日志文件')
      }
      const zip = new AdmZip()
      for (let fileName of fileNames) {
        zip.addLocalFile(join(loggerPath, fileName))
      }
      const user = getUser()
      const now = new Date()
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')
      const tmp = [
        process.platform,
        process.arch,
        `${year}${month}${day}${hours}${minutes}${seconds}`,
        user?.user_name || user?.email || user?.tel || '未知',
        user?.user_id || user?.id || 0,
      ]
      const zipName = tmp.join('-') + '.zip'
      zipPath = join(loggerPath, zipName)
      zip.writeZip(zipPath)
      // 上传压缩文件
      const form = new FormData()
      form.append('file', fs.createReadStream(zipPath), zipName)
      const headers = {
        ...form.getHeaders(),
      }
      console.log(`uploading logger file "${zipPath}"`)
      await axios.post(`${getBaseURL()}/upload`, form, { headers })
      console.log(`uploaded logger file "${zipPath}"`)
      resolve()
    } catch (err) {
      reject(err)
    } finally {
      // 删除压缩文件
      if (zipPath) {
        console.log(`delete logger file "${zipPath}"`)
        try { fs.rmSync(zipPath) } catch { }
      }
    }
  })
}

const initIPC = () => {
  registeIPCHandle('logger.open', open)
  registeIPCHandle('logger.upload', upload)
}

const initialize = () => {
  initIPC()
}

const init = () => {
  level = levels[process.argv.find(arg => arg.startsWith('LOG_LEVEL='))?.replace('LOG_LEVEL=', '')] || levels.WARN
  logger = pino({
    level: level,
    formatters: {
      level(label) {
        return { level: label }
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }, pino.multistream(streams))

  setTimeout(cleanOldLogs, 60 * 1000)
  setInterval(cleanOldLogs, 60 * 60 * 1000)

  registryReady('logger', initialize)
}

module.exports = {
  init,
  error: console.error,
  warn: console.warn,
  info: console.info,
  log: console.log,
}