console.log('Loaded world clock injection.js');

(()=>{
	let wasDay = true;
	
	// Hook a various UI elements
	let markerButton = document.querySelector('div[title="Marker-List"]'); // Gets removed on map changes
	const mapButton = document.querySelector('div[title="Map-List"]');
	const playerButton = document.querySelector('div[title="Player-List"]');
	const dayNightToggle = document.querySelector('div[title="Day/Night"]');
	const xInput = document.querySelector('div.position-input.pos-input > div.number-input:nth-child(1)');
	const yInput = document.querySelector('div.position-input.pos-input > div.number-input:nth-child(2)');
	
	// Create a spacer element
	const spacerContainer = document.createElement('div');
	spacerContainer.classList.add('space', 'thin-hide');
	
	// Create the World Info Container
	const worldInfoContainer = document.createElement('div');
	worldInfoContainer.classList.add('position-input', 'pos-input');
	worldInfoContainer.style.maxWidth = '5em';
	worldInfoContainer.innerHTML = '<div class="number-input" style="position:relative;"><img style="width: 46px;top: -8px;left: -8px; position: absolute;" src="/scripts/img/day.svg"><label><span class="label"></span><input type="text" readonly value="Sleep"></label></div>';
	
	// Hook the Clock Container
	const worldClock = worldInfoContainer.querySelector('input');
	const worldWeather = worldInfoContainer.querySelector('img');
	
	// Add Map Change Events to Clock
	const mapTypesSelectors = {
		flat: document.querySelector('div.svg-button[title="Orthographic / Flat-View"]'),
		perspective: document.querySelector('div.svg-button[title="Perspective-View"]'),
		free: document.querySelector('div.svg-button[title="Free-Flight / Spectator Mode"]'),
	};
	const mapTypes = Object.keys(mapTypesSelectors);

	// Left click clock to toggle map mode
	worldInfoContainer.onclick = e => {
		const currentMapType = bluemap.appState.controls.state;
		let typeIndex = mapTypes.indexOf(currentMapType) + 1;
		if (typeIndex >= mapTypes.length) typeIndex = 0;
		mapTypesSelectors[mapTypes[typeIndex]].click();
	}
	
	// Right click clock for Map Menu
	worldInfoContainer.oncontextmenu = e => {
		e.preventDefault();
		mapButton.click();
		setTimeout(()=>{
			const menuCloseButton = document.querySelector('div.side-menu > div.svg-button.menu-button.close');
			const mapSelectButtons = document.querySelectorAll('div.side-menu div.map-button');
			mapSelectButtons.forEach((v,i)=>{
				v.onclick = (e)=> {
					menuCloseButton.click();
					setTimeout(()=>{
						markerButton = document.querySelector('div[title="Marker-List"]');
					},500);
				};
			});
		},500);
	}
	
	// Right click xInput for Player Menu
	xInput.oncontextmenu = e => {
		e.preventDefault();
		playerButton.click();
	}
	
	// Right click yInput for Marker Menu
	yInput.oncontextmenu = e => {
		e.preventDefault();
		markerButton.click();
	}
	
	// Append the Spacer and World Info Container
	dayNightToggle.after(worldInfoContainer);
	dayNightToggle.after(spacerContainer);
	
	async function updateWorldData() {
		const response = await fetch('/scripts/world.php?nameAsKey');
		const worlds = await response.json();
		
		const currentWorld = bluemap.mapViewer.map.data.id
		
		// 5a951baf-7880-4e20-9829-119a511fab64 = 1_20
		const worldData = worlds[currentWorld];
		
		if (!worldData) {
			// Indicate server sleeping, Check more slowly for updates
			worldClock.value = "Sleep";
			setTimeout(updateWorldData, 15000);
			return;
		}
		
		// Calculate Time
		const worldTime = worldData.time + 6000;
		const worldTimePercent = worldTime / 24000;
		const worldHourRaw = Math.floor(24 * worldTimePercent);
		const worldHour = worldHourRaw - (worldHourRaw > 23 ? 24 : 0);
		const worldMinutePercent = (24 * worldTimePercent) - worldHourRaw;
		const worldMinute = Math.floor(60 * worldMinutePercent);
		const isDay = worldData.time < 12000;
		
		// Automatically toggle night and day
		if (dayNightToggle.classList.contains('active') == isDay) dayNightToggle.click();

		// Display Time
		worldClock.value = `0${worldHour}`.slice(-2)+`:`+`0${worldMinute}`.slice(-2);
		
		// Calculate Weather
		let iconName = (isDay ? 'day' : 'night');
		if (worldData.storm) iconName = (worldData.thundering ? 'thunder' : (isDay ? 'rainy-sun' : 'rainy-night'));
		
		// Set the icon
		worldWeather.src = `/scripts/img/${iconName}.svg`;
		
		// Next Check
		setTimeout(updateWorldData, 3000);
	}
	
	// Initialize World Function
	updateWorldData();

	// Output the captures and created frames for debugging
	console.log({
		map: mapButton,
		marker: markerButton,
		player: playerButton,
		xInput: xInput,
		yInput: yInput,
		dayNight: dayNightToggle,
		mapTypeSelectors: mapTypesSelectors,
		worldInfoContainer: worldInfoContainer,
		worldClock: worldClock,
		worldWeather: worldWeather,
		spacerContainer: spacerContainer,
	});
})()


