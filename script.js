
let currentScene = 0;
const totalScenes = 4; 

const margin = { top: 40, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 550 - margin.top - margin.bottom;

let stationData, durationData, hourlyData, chicagoMapData;

const svg = d3.select("#vis-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


Promise.all([
    d3.csv("data/station_trip_counts.csv"),
    d3.csv("data/trip_duration_distribution.csv"),
    d3.csv("data/trips_by_hour.csv"),
    d3.json("https://raw.githubusercontent.com/d3/d3.github.com/master/chicago.json") // Chicago TopoJSON data
]).then(function(files) {
    stationData = files[0];
    durationData = files[1];
    hourlyData = files[2];
    
    let chicagoTopoJSON = files[3];
    chicagoMapData = topojson.feature(chicagoTopoJSON, chicagoTopoJSON.objects.collection);

    stationData.forEach(d => {
        d.trip_count = +d.trip_count;
        d.lat = +d.lat;
        d.lng = +d.lng;
    });
    durationData.forEach(d => {
        d.casual_count = +d.casual_count;
        d.member_count = +d.member_count;
    });
    hourlyData.forEach(d => {
        d.start_hour = +d.start_hour;
        d.casual_count = +d.casual_count;
        d.member_count = +d.member_count;
    });

    console.log("All data loaded and processed.");
    init(); 
}).catch(function(err) {
    console.error("Error loading data:", err);
});


function init() {
    d3.select("#next-button").on("click", () => {
        if (currentScene < totalScenes - 1) {
            currentScene++;
            drawScene();
        }
    });

    d3.select("#prev-button").on("click", () => {
        if (currentScene > 0) {
            currentScene--;
            drawScene();
        }
    });

    drawScene();
}


function drawScene() {
    svg.selectAll("*").remove();

    d3.select("#prev-button").property("disabled", currentScene === 0);
    d3.select("#next-button").property("disabled", currentScene === totalScenes - 1);

    switch (currentScene) {
        case 0:
            drawScene0();
            break;
        case 1:
            drawScene1();
            break;
        case 2:
            drawScene2();
            break;
        case 3:
            drawScene3();
            break;
    }
}



function drawScene0() {
    d3.select("#scene-title").text("Scene 1: The Network's Pulse");
    d3.select("#scene-description").text("Chicago's Divvy network serves riders across the city, but usage is heavily concentrated in popular areas.");

    const projection = d3.geoMercator()
        .fitSize([width, height], chicagoMapData);

    const path = d3.geoPath().projection(projection);

    svg.append("g")
        .selectAll("path")
        .data(chicagoMapData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#e9e9e9")
        .attr("stroke", "#aaa");

    const radius = d3.scaleSqrt()
        .domain([0, d3.max(stationData, d => d.trip_count)])
        .range([1, 15]); 

    svg.selectAll("circle")
        .data(stationData)
        .enter().append("circle")
        .attr("transform", d => `translate(${projection([d.lng, d.lat])})`)
        .attr("r", d => radius(d.trip_count))
        .attr("class", "member-color") 
        .attr("opacity", 0.6);
}


function drawScene1() {
    d3.select("#scene-title").text("Scene 2: The Commute vs. The Cruise");
    d3.select("#scene-description").text("Members primarily take short, direct trips, while casual riders enjoy longer, more leisurely rides.");

    const groups = durationData.map(d => d.duration_bin);
    const maxCount = d3.max(durationData, d => Math.max(d.member_count, d.casual_count));

    const x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding(0.2);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    const y = d3.scaleLinear()
        .domain([0, maxCount])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));
        
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Number of Trips");

    svg.selectAll("rect.member")
        .data(durationData)
        .enter()
        .append("rect")
        .attr("class", "member-color")
        .attr("x", d => x(d.duration_bin))
        .attr("y", d => y(d.member_count))
        .attr("width", x.bandwidth() / 2)
        .attr("height", d => height - y(d.member_count));
        
    svg.selectAll("rect.casual")
        .data(durationData)
        .enter()
        .append("rect")
        .attr("class", "casual-color")
        .attr("x", d => x(d.duration_bin) + x.bandwidth() / 2)
        .attr("y", d => y(d.casual_count))
        .attr("width", x.bandwidth() / 2)
        .attr("height", d => height - y(d.casual_count));
}


function drawScene2() {
    d3.select("#scene-title").text("Scene 3: Weekday Warriors & Weekend Wanderers");
    d3.select("#scene-description").text("Riding times reveal a classic commuter profile for members (8 AM/5 PM peaks) and a leisure profile for casual users.");

    const maxCount = d3.max(hourlyData, d => Math.max(d.member_count, d.casual_count));

    const x = d3.scaleLinear()
        .domain([0, 23])
        .range([0, width]);
        
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(24));
        
    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("x", width/2)
       .attr("y", height + margin.bottom - 10)
       .text("Hour of the Day");

    const y = d3.scaleLinear()
        .domain([0, maxCount])
        .range([height, 0]);
        
    svg.append("g")
        .call(d3.axisLeft(y));
        
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Number of Trips");

    svg.append("path")
        .datum(hourlyData)
        .attr("fill", "none")
        .attr("stroke", "#1f77b4")
        .attr("stroke-width", 2.5)
        .attr("d", d3.line()
            .x(d => x(d.start_hour))
            .y(d => y(d.member_count))
        );
        
    svg.append("path")
        .datum(hourlyData)
        .attr("fill", "none")
        .attr("stroke", "#ff7f0e")
        .attr("stroke-width", 2.5)
        .attr("d", d3.line()
            .x(d => x(d.start_hour))
            .y(d => y(d.casual_count))
        );
}


function drawScene3() {
    d3.select("#scene-title").text("Scene 4: Explore Rider Routes");
    d3.select("#scene-description").text("This scene is a placeholder for an interactive map. Click events on stations would trigger route line drawing.");

 
    const projection = d3.geoMercator().fitSize([width, height], chicagoMapData);
    const path = d3.geoPath().projection(projection);
    
    svg.append("g")
        .selectAll("path")
        .data(chicagoMapData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#e9e9e9")
        .attr("stroke", "#aaa");

    svg.selectAll("circle")
        .data(stationData)
        .enter().append("circle")
        .attr("transform", d => `translate(${projection([d.lng, d.lat])})`)
        .attr("r", 3)
        .attr("fill", "black")
        .on("click", (event, d) => {
            svg.selectAll(".annotation-group").remove(); // Clear previous annotations
            
            const annotation = [{
                note: { title: d.start_station_name, label: "Showing top routes would require more data processing." },
                x: projection([d.lng, d.lat])[0],
                y: projection([d.lng, d.lat])[1],
                dy: -50,
                dx: 50
            }];
            
            const makeAnnotations = d3.annotation().annotations(annotation);
            svg.append("g").attr("class", "annotation-group").call(makeAnnotations);
        });
        
    svg.append("text")
        .attr("x", width/2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Click a station to see details");
}