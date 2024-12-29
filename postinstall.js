const os = require('os')
const JSZip = require('jszip')
const rp = require('request-promise-native')
const targz = require('tar.gz')
const { writeFile, rename, mkdtemp, chmod } = require('fs').promises

// get a single file from a zip buffer
const unZipFile = async (data, inpath, outpath) => {
  const zip = await JSZip.loadAsync(data)
  const d = await zip.file(inpath).async('arraybuffer')
  await writeFile(outpath, Buffer.from(d))
}

// get a single file from a tarball buffer
const unTarballFile = async (data, inpath, outpath) => {
  const dir = await mkdtemp(`${os.tmpdir()}/sqldef`)
  await writeFile(`${dir}/sqldef.tar.gz`, data)
  await targz().extract(`${dir}/sqldef.tar.gz`, dir)
  await rename(`${dir}/${inpath}`, outpath)
}

let arch = os.arch()
let platform = os.platform()
if (platform === 'win32') platform = 'windows'
if (arch === 'x64') arch = 'amd64'
const ext = platform === 'linux' ? 'tar.gz' : 'zip'

const run = async () => {
  console.log('Downloading & extracting compiled sqldef binaries.')
  const dataM = await rp({ url: `https://github.com/sqldef/sqldef/releases/latest/download/mysqldef_${platform}_${arch}.${ext}`, method: 'GET', encoding: null })
  const dataP = await rp({ url: `https://github.com/sqldef/sqldef/releases/latest/download/psqldef_${platform}_${arch}.${ext}`, method: 'GET', encoding: null })
  const getFile = ext === 'zip' ? unZipFile : unTarballFile
  await getFile(dataM, 'mysqldef', `${__dirname}/mysqldef`)
  await chmod(`${__dirname}/mysqldef`, '755')
  await getFile(dataP, 'psqldef', `${__dirname}/psqldef`)
  await chmod(`${__dirname}/psqldef`, '755')
}
run()
