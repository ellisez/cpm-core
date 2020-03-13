
const commands={
	build: {
		fn: require('./build'),
		description: 'build and output native dist.'
	},
	serve: {
		fn: require('./serve'),
		description: 'native connect url for hotload server'
	},
	start: {
		fn: require('./start'),
		description: 'start native app'
	},
	debug: {
		fn: require('./debug'),
		description: 'develop debug mode'
	}
};

function help() {
	const rawCommand=process.argv.slice(2).join(' ');
	let msg=`usage: ${rawCommand} <commands>\n`;
	msg+='commands:\n';
	Object.keys(commands).forEach(commandName=>{
		const commandObject=commands[commandName];
		msg+=`\t${commandName}: ${commandObject.description}\n`
	})
	console.error(msg);
	process.exit(0);
}

function error(msg) {
	console.error(msg);
	process.exit(0);
}

module.exports=function (commandName, args) {
	if (!commandName || commandName==='help') {
		help();
	}
	const commandObject=commands[commandName];
	if (!commandObject) {
		error(`can not found ${commandName} command!`);
	}
	commandObject.fn(args);
}