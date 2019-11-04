const exec = require('util').promisify(require('child_process').exec)

// type, database, user, password, host, port, socket, file, dry, get
module.exports = async ({ type, database, dry, get, ...o }) => {
  const cmd = type === 'postgres' ? 'psqldef' : 'mysqldef'
  const args = Object.keys(o).map(k => o[k] ? `--${k}=${JSON.stringify(o[k])}` : '')
  if (dry) {
    args.push('--dry-run')
  }
  if (get) {
    args.push('--export')
  }
  try {
    return (await exec(`${__dirname}/${cmd} ${database} ${args.join(' ')}`)).stdout
  } catch (e) {
    throw new Error(e.message)
  }
}
