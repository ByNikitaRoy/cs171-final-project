# A media and language analysis of the Russia-Ukraine War

## Description
This is the code base for the website [www.ukrainenewsviz.com](https://www.ukrainenewsviz.com).

## File Layout
The directory structure is as follows:

DIRECTORY           | DESCRIPTION
--------------------|----------------------
`.`                 | Files such as index.html, README and CNAME
`./css/`            | All the CSS files related to the styling of the webpage
`./data/`           | Data files in .csv and .json format used for the visualizations
`./fonts/`          | Font assets used on the webpage
`./img/`            | Image files used on the webpage
`./js/`             | Javascript files for the visualization

## Data Files
The following are descriptions of the data files used for the visualizations

`./data/Events_for_bubble_chart.csv`

COLUMN          | DESCRIPTION
--------------------|----------------------
Date  | Date ranges from February 1, 2022 to April 30,2022 
Event           | News event gathered from NY Times Tracker


`./data/cableNewsCoverageUpdate.csv`

COLUMN          | DESCRIPTION
--------------------|----------------------
Date | Date ranges from November 17, 2021 to November 15, 2022
Series  | TV News Channel
Value          | Percentage of airtime coverage about Ukraine

`./data/new_data_topics.csv`

COLUMN          | DESCRIPTION
--------------------|----------------------
Date  | Date of news coverage
Keyword          | All 8 keywords used in the bubble chart
Percentage of articles about keyword      | Percentage of articles about  keyword

`./data/newsVolumeOverTime.csv`

COLUMN          | DESCRIPTION
--------------------|----------------------
Date  | Date of news coverage
Value            | Percentage of online news articles about Ukraine
Deaths          | Number of deaths reported 
sevent         | Boolean value for event tooltip
sdescription           | Event description to be included on tooltip for the online news coverage chart

`./data/sentimentAnalysisFinal.csv`

COLUMN          | DESCRIPTION
--------------------|----------------------
Date  | Date ranges from January 1, 2022 to November 17, 2022
DomainCountryCode            | ISO Country Code of the country where the article is published from
AverageDocTone          | Sentiment Analysis index value that measures the average tone of the article
NumberOfArticles        | Total number of articles published 
Country            | Country where the article is published from
Lat        | Latitude coordinate
Lon           | Longitude coordinate
NATO           | Boolean value to indicate whether the country is part of the NATO
Region       | Region the Country column belongs to 
Continent          | Continent the Country column belongs to

## Process Book 
You can access our team's process book [here](https://docs.google.com/document/d/1irR4jf540PWl2ra0mtCrA8QF9EhPCa9it9RGLRUddk8/edit?usp=sharing).

## Contributors
- Ana Merla
- Steven Morse
- Nikita Roy