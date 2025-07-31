# CS416 Narrative Visualization

Access via `https://ngomes16.github.io/CS416_Narrative_Visualization`
This project is has a visualization about Chicago's Divvy bike-sharing data, comparing usage patterns between members and casual riders.

## Project Structure

- **Interactive Slideshow**: The visualization follows an interactive slideshow structure where users can explore different aspects of the data at each step.

## Scenes

1. **Scene 1: The Network's Pulse** - Shows station locations and trip counts across Chicago
2. **Scene 2: The Commute vs. The Cruise** - Compares trip duration patterns between members and casual riders
3. **Scene 3: Weekday Warriors & Weekend Wanderers** - Shows hourly usage patterns throughout the day
4. **Scene 4: Explore Rider Routes** - Interactive exploration of individual station data

## Data Files

- `data/202501-divvy-tripdata.csv.zip` - Full Divvy data from January 2025. All below files have extracted data from this file
- `data/station_trip_counts.csv` - Station locations and trip counts
- `data/trip_duration_distribution.csv` - Trip duration patterns by rider type
- `data/trips_by_hour.csv` - Hourly usage patterns

## Technologies Used

- D3.js for visualization
- d3-annotation for annotations
- HTML5/CSS3 for layout and styling

## Features

- **Scenes**: Four distinct scenes with different visualizations
- **Annotations**: Interactive annotations using d3-annotation library
- **Parameters**: State management for scene navigation
- **Triggers**: Button clicks and mouse interactions
- **Responsive Design**: Clean, modern UI with hover effects

## Navigation

- Use "Previous" and "Next" buttons to navigate between scenes
- Hover over data points for additional information
- Click on stations in Scene 4 for detailed annotations 