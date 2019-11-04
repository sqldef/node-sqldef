# node-sqldef

Simple node wrapper around [sqldef](https://github.com/k0kubun/sqldef) for easy use with node.

This is a super-simple wrapper around [sqldef](https://github.com/k0kubun/sqldef) that will download the appropriate (for your platform/arch) CLI from [sqldef releases](https://github.com/k0kubun/sqldef/releases) and run it. It works with mysql & postgres.

If it's unclear how this might be usful in your workflow, just checkout [this live demo](https://sqldef.github.io/sqldef-wasm/).

## usage

Install it in your project as a dev-dependency, or use it standalone in [npx](https://www.npmjs.com/package/npx):

```bash
npm i -D sqldef

# or

npx sqldef --help
```

### Code

You can use it in your own code (like for migration scripts or whatever)

```js
import sqldef from 'sqldef'

const main = async () => {
  const output = await (sqldef({
    type,         // the type of your database ("mysql" or "postgres")
    database,     // the name of your database
    user,         // the username of your database
    password,     // the password of your database
    host,         // the hostname of your database
    port,         // the port of your database
    socket,       // the unix socket (for mysql)
    file,         // the schema file to read/write
    dry: true,    // dry run - don't do anything to the database
    get: true     // get the current definition from database
  }))
}
main()

```

### CLI

Use it in your [npm scripts](https://docs.npmjs.com/cli/run-script).

```
Usage: sqldef <command> [options]

Commands:
  sqldef export  Export your database to a file
  sqldef import  Import your database from a file

Options:
  -?, --help        Show help                                          [boolean]
  -f, --file        The schema file to import/export     [default: "schema.sql"]
  -t, --type        The type of the database                  [default: "mysql"]
  -h, --host        The host of the database              [default: "localhost"]
  -d, --database    The name of the database                   [default: "test"]
  -u, --user        The user of the database                   [default: "root"]
  -P, --password    The password for the database                  [default: ""]
  -p, --port        The port of the database
  -s, --socket      The socket of the database (only for mysql)
  -x, --no-confirm  Don't confirm before running the import/export     [boolean]
  -v, --version     Show version number                                [boolean]

Examples:
  cli.js export --user=cool                 Save your current schema, from your
  --password=mysecret                       mysql database, in schema.sql
  --database=mydatabase
  cli.js import --user=cool                 Save the structure from your currnet
  --password=mysecret                       database in schema.sql
  --database=mydatabase
```

#### configuration

This uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig), which gives us a lot of options for configuration, and your settings will be merged from all the things you setup.

- a `sqldef` property in `package.json`
- a `.sqldefrc` file in JSON or YAML format
- a `.sqldefrc.json` file
- a `.sqldefrc.yaml`, `.sqldefrc.yml`, or `.sqldefrc.js` file
- a `sqldef.config.js` file exporting a JS object

#### ideas

Here are some cool ways to use this tool in your project.

**development**

Make a file called `schema.sql`, and make a `.sqldefrc` file with your settings. Make sure `.sqldefrc` is in your `.gitignore`, so you don't accidentally check-in your database secrets.

**.sqldefrc**
```yaml
type: mysql
host: localhost
database: test
user: root
password: root
file: schema.sql
```

Maybe also make a `.sqldefrc.example` to help your users set stuff up.

Now you can run `npx sqldef import` to apply the schema in `schema.sql`, and `npx sqldef export` to put the current structure in the database from your `schema.sql`.

**CI**

Let's say you want to run it in CI with the schema in `schema.sql`. I recommend you use environment-variables to keep all the config in your CI settings:

```sh
DB_TYPE=mysql
DB_HOST=mysqlhost.com
DB_PWD=mysecretpassword
DB_USER=root
```

Now, install as a dev-dependency in your project with `npm i -D sqldef`, and make a script in `package.json` for doing schema migration:

```json
{
  "scripts": {
    "migrate": "sqldef import --file=schema.sql --type=$DB_TYPE --host=$DB_HOST --password=$DB_PWD --user=$DB_USER --no-confirm",
    "schema": "sqldef export --file=schema.sql --type=$DB_TYPE --host=$DB_HOST --password=$DB_PWD --user=$DB_USER"
  }
}
```

Now, configure your CI to execute `npm run migrate` when code gets checked in. You might want to keep the above `.sqldefrc` method (from above) for development. The configuration you setup there will override the `DB_` environment vars, so it should work pretty well together.
