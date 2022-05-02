import os from 'os';

export = {
	average: function () {
		var totalIdle = 0;
		var totalTick = 0;
		var cpus = os.cpus();

		for (var i = 0, len = cpus.length; i < len; i++) {
			var cpu = cpus[i];
			for (var type in cpu.times) {
				totalTick += cpu.times[type];
			}
			totalIdle += cpu.times.idle;
		}

		return {
			totalIdle: totalIdle,
			totalTick: totalTick,
			avgIdle: totalIdle / cpus.length,
			avgTotal: totalTick / cpus.length,
		};
	},
	usage: function (interval?: number) {
		var self = this;

		if (!interval) {
			interval = 1000;
		}

		return new Promise(function (resolve) {
			if (typeof interval !== 'number') {
				throw new TypeError('interval must be a number!');
			}

			var startMeasure = self.average();

			setTimeout(function () {
				var endMeasure = self.average();
				var idleDifference = endMeasure.avgIdle - startMeasure.avgIdle;
				var totalDifference = endMeasure.avgTotal - startMeasure.avgTotal;
				var cpuPercentage =
					(10000 - Math.round((10000 * idleDifference) / totalDifference)) / 100;

				return resolve(cpuPercentage);
			}, interval);
		});
	},
};
