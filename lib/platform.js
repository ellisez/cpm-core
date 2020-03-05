module.exports=function (commandArgs) {
	const rawArgv = commandArgs || process.argv.slice(2);

	const { warn, error, isPlugin, resolvePluginId, loadModule } = require('@vue/cli-shared-utils');
	const readPkg = require('read-pkg');
	const path = require('path');

	const pkg = readPkg.sync(path.resolve(__dirname, '..'));
	const plugins = Object.keys(pkg.devDependencies || {})
		.concat(Object.keys(pkg.dependencies || {}))
		.filter(isPlugin)
		.map(id => {
			if (
				pkg.optionalDependencies &&
				id in pkg.optionalDependencies
			) {
				let apply = () => {}
				try {
					apply = require(id)
				} catch (e) {
					warn(`Optional dependency ${id} is not installed.`)
				}

				return { id, apply }
			} else {
				return {
					id,
					apply: require(id)
				}
			}
		})

// start Service
	const Service = require('@vue/cli-service');
	const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd(), { plugins })

	const args = require('minimist')(rawArgv, {
		boolean: [
			// build
			'modern',
			'report',
			'report-json',
			'inline-vue',
			'watch',
			// serve
			'open',
			'copy',
			'https',
			// inspect
			'verbose'
		]
	})
	const command = args._[0]

	service.run(command, args, rawArgv).catch(err => {
		error(err)
		process.exit(1)
	})
}
