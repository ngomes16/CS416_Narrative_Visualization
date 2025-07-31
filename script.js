
let currentScene = 0;
const totalScenes = 4; 

const margin = { top: 40, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 550 - margin.top - margin.bottom;

let stationData, durationData, hourlyData;

const svg = d3.select("#vis-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

Promise.all([
    d3.csv("data/station_trip_counts.csv"),
    d3.csv("data/trip_duration_distribution.csv"),
    d3.csv("data/trips_by_hour.csv")
]).then(function(files) {
    stationData = files[0];
    durationData = files[1];
    hourlyData = files[2];
    
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
    console.log("Station data:", stationData.length, "records");
    console.log("Duration data:", durationData.length, "records");
    console.log("Hourly data:", hourlyData.length, "records");
    
    if (stationData.length === 0 || durationData.length === 0 || hourlyData.length === 0) {
        throw new Error("One or more data files are empty");
    }
    
    init(); 
}).catch(function(err) {
    console.error("Error loading data:", err);
    d3.select("#vis-container")
        .append("div")
        .style("text-align", "center")
        .style("padding", "50px")
        .style("color", "red")
        .html(`<h3>Error Loading Data</h3><p>${err.message}</p><p>Please check that all data files are present and accessible.</p>`);
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
    console.log("Drawing scene:", currentScene);
    
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
        default:
            console.error("Unknown scene:", currentScene);
    }
    
    console.log("Scene", currentScene, "drawn successfully");
}



function drawScene0() {
    d3.select("#scene-title").text("Scene 1: The Network's Pulse");
    d3.select("#scene-description").text("The Divvy network is across Chicago, but usage is heavily concentrated in popular areas.");

    const x = d3.scaleLinear()
        .domain(d3.extent(stationData, d => d.lng))
        .range([0, width]);
        
    const y = d3.scaleLinear()
        .domain(d3.extent(stationData, d => d.lat))
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
        
    svg.append("g")
        .call(d3.axisLeft(y));
        
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", height + margin.bottom - 10)
        .text("Longitude");
        
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Latitude");

    const radius = d3.scaleSqrt()
        .domain([0, d3.max(stationData, d => d.trip_count)])
        .range([2, 20]); 

    svg.selectAll("circle")
        .data(stationData)
        .enter().append("circle")
        .attr("cx", d => x(d.lng))
        .attr("cy", d => y(d.lat))
        .attr("r", d => radius(d.trip_count))
        .attr("class", "member-color") 
        .attr("opacity", 0.6)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("opacity", 0.6);
        });
        
    svg.append("text")
        .attr("x", width/2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Station Locations (circle size = trip count)");
}


function drawScene1() {
    d3.select("#scene-title").text("Scene 2: The Commute vs. The Cruise");
    d3.select("#scene-description").text("Members take shorter trips, while casual riders enjoy longer ones.");

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
        
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", height + margin.bottom - 10)
        .text("Trip Duration");

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
        .attr("height", d => height - y(d.member_count))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.8);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("opacity", 1);
        });
        
    svg.selectAll("rect.casual")
        .data(durationData)
        .enter()
        .append("rect")
        .attr("class", "casual-color")
        .attr("x", d => x(d.duration_bin) + x.bandwidth() / 2)
        .attr("y", d => y(d.casual_count))
        .attr("width", x.bandwidth() / 2)
        .attr("height", d => height - y(d.casual_count))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.8);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("opacity", 1);
        });
        
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 150}, 20)`);
        
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("class", "member-color");
        
    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("Members");
        
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 25)
        .attr("width", 15)
        .attr("height", 15)
        .attr("class", "casual-color");
        
    legend.append("text")
        .attr("x", 20)
        .attr("y", 37)
        .text("Casual Riders");
}


function drawScene2() {
    d3.select("#scene-title").text("Scene 3: Weekday Warriors & Weekend Wanderers");
    d3.select("#scene-description").text("We see a commuter profile (8 AM/5 PM peaks) for members and a leisure profile for casual users.");

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

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(24).tickSize(-height).tickFormat(""));

    svg.append("path")
        .datum(hourlyData)
        .attr("fill", "none")
        .attr("stroke", "#1f77b4")
        .attr("stroke-width", 3)
        .attr("d", d3.line()
            .x(d => x(d.start_hour))
            .y(d => y(d.member_count))
        );
        
    svg.append("path")
        .datum(hourlyData)
        .attr("fill", "none")
        .attr("stroke", "#ff7f0e")
        .attr("stroke-width", 3)
        .attr("d", d3.line()
            .x(d => x(d.start_hour))
            .y(d => y(d.casual_count))
        );
        
    svg.selectAll("circle.member")
        .data(hourlyData)
        .enter()
        .append("circle")
        .attr("class", "member-color")
        .attr("cx", d => x(d.start_hour))
        .attr("cy", d => y(d.member_count))
        .attr("r", 3)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 5);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("r", 3);
        });
        
    svg.selectAll("circle.casual")
        .data(hourlyData)
        .enter()
        .append("circle")
        .attr("class", "casual-color")
        .attr("cx", d => x(d.start_hour))
        .attr("cy", d => y(d.casual_count))
        .attr("r", 3)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 5);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("r", 3);
        });
        
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 150}, 20)`);
        
    legend.append("line")
        .attr("x1", 0)
        .attr("y1", 10)
        .attr("x2", 20)
        .attr("y2", 10)
        .attr("stroke", "#1f77b4")
        .attr("stroke-width", 3);
        
    legend.append("text")
        .attr("x", 25)
        .attr("y", 15)
        .text("Members");
        
    legend.append("line")
        .attr("x1", 0)
        .attr("y1", 35)
        .attr("x2", 20)
        .attr("y2", 35)
        .attr("stroke", "#ff7f0e")
        .attr("stroke-width", 3);
        
    legend.append("text")
        .attr("x", 25)
        .attr("y", 40)
        .text("Casual Riders");
}


function drawScene3() {
    d3.select("#scene-title").text("Scene 4: Explore Rider Routes");
    d3.select("#scene-description").text("Interactive exploration of station data. Click on stations to see details.");

    const x = d3.scaleLinear()
        .domain(d3.extent(stationData, d => d.lng))
        .range([0, width]);
        
    const y = d3.scaleLinear()
        .domain(d3.extent(stationData, d => d.lat))
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
        
    svg.append("g")
        .call(d3.axisLeft(y));
        
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", height + margin.bottom - 10)
        .text("Longitude");
        
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Latitude");

    svg.on("click", function(event) {
        if (event.target === this) {
            svg.selectAll(".annotation-group").remove();
        }
    });

    svg.selectAll("circle")
        .data(stationData)
        .enter().append("circle")
        .attr("cx", d => x(d.lng))
        .attr("cy", d => y(d.lat))
        .attr("r", 4)
        .attr("fill", "#333")
        .attr("opacity", 0.7)
        .on("click", function(event, d) {
            event.stopPropagation();
            
            svg.selectAll(".annotation-group").remove();
            
            const annotationGroup = svg.append("g").attr("class", "annotation-group");
            
            let annotationX = x(d.lng) + 50;
            let annotationY = y(d.lat) - 60;
            
            if (annotationX + 200 > width) {
                annotationX = x(d.lng) - 250;
            }
            
            if (annotationY - 100 < 0) { 
                annotationY = y(d.lat) + 60; 
            }
            
            const textContent = `${d.start_station_name}\nTrip Count: ${d.trip_count.toLocaleString()}\nLocation: (${d.lat.toFixed(4)}, ${d.lng.toFixed(4)})`;
            const lines = textContent.split('\n');
            const lineHeight = 16;
            const padding = 8;
            const textWidth = Math.max(...lines.map(line => line.length * 8)); 
            const boxWidth = textWidth + padding * 2;
            const boxHeight = lines.length * lineHeight + padding * 2;
            
            annotationGroup.append("rect")
                .attr("x", annotationX)
                .attr("y", annotationY - boxHeight)
                .attr("width", boxWidth)
                .attr("height", boxHeight)
                .attr("fill", "white")
                .attr("stroke", "#333")
                .attr("stroke-width", "2")
                .attr("opacity", "1");
            
            let lineX2, lineY2;
            
            if (annotationX > x(d.lng)) {
                lineX2 = annotationX;
                lineY2 = annotationY - boxHeight / 2;
            } else {
                lineX2 = annotationX + boxWidth;
                lineY2 = annotationY - boxHeight / 2;
            }
            
            annotationGroup.append("line")
                .attr("x1", x(d.lng))
                .attr("y1", y(d.lat))
                .attr("x2", lineX2)
                .attr("y2", lineY2)
                .attr("stroke", "#333")
                .attr("stroke-width", "1");
            
            lines.forEach((line, i) => {
                annotationGroup.append("text")
                    .attr("x", annotationX + padding)
                    .attr("y", annotationY - boxHeight + padding + (i + 1) * lineHeight - 4)
                    .attr("fill", "#333")
                    .attr("font-size", i === 0 ? "14px" : "12px")
                    .attr("font-weight", i === 0 ? "bold" : "normal")
                    .text(line);
            });
        })
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1).attr("r", 6);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("opacity", 0.7).attr("r", 4);
        });
        
    svg.append("text")
        .attr("x", width/2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Click a station to see details");
}
