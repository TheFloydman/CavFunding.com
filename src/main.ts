import "./style.css";
import ApexCharts from "apexcharts";
import rawCsvData from "../public/cavfunding.csv?raw";

type Month = {
  oneIndex: number,
  longName: string,
  shortName: string
}

function parseCsv(csvText: string) {

  const months: Month[] = [
    { oneIndex: 1, longName: 'January', shortName: 'Jan' },
    { oneIndex: 2, longName: 'February', shortName: 'Feb' },
    { oneIndex: 3, longName: 'March', shortName: 'Mar' },
    { oneIndex: 4, longName: 'April', shortName: 'Apr' },
    { oneIndex: 5, longName: 'May', shortName: 'May' },
    { oneIndex: 6, longName: 'June', shortName: 'Jun' },
    { oneIndex: 7, longName: 'July', shortName: 'Jul' },
    { oneIndex: 8, longName: 'August', shortName: 'Aug' },
    { oneIndex: 9, longName: 'September', shortName: 'Sep' },
    { oneIndex: 10, longName: 'October', shortName: 'Oct' },
    { oneIndex: 11, longName: 'November', shortName: 'Nov' },
    { oneIndex: 12, longName: 'December', shortName: 'Dec' }
  ];

  const rows = csvText.trim().split("\n").map(row => row.trim()).filter(row => row !== "");
  const dataRows = rows.slice(3).map(row => row.split(",").map(cell => cell.trim()));
  const categories = dataRows.map(row => `${months.find(month => month.oneIndex == Number(row[1]))?.shortName ?? 'Ukn'} ${row[2]}`);

  return { dataRows, categories };

}

function postToElement(elementId: string, options: ApexCharts.ApexOptions): void {
  const element = document.getElementById(elementId);
  if (element) {
    new ApexCharts(element, options).render();
  } else {
    console.error(`Could not find an element with id="${elementId}" in the DOM.`);
  }
}

function buildOptions(series: ApexCharts.ApexNonAxisChartSeries, categories: (string | number)[][] | (string | number)[], chartLabel: string, xAxisLabel: string, yAxisLabel: string, strokeWidth: number | number[], isPercent = false): ApexCharts.ApexOptions {
  return {
    chart: {
      type: "line",
      height: 500,
      fontFamily: "inherit",
      toolbar: {
        show: true,
        autoSelected: 'pan'
      },
      zoom: {
        enabled: true
      }
    },
    series: series,
    xaxis: {
      categories: categories,
      title: {
        text: xAxisLabel
      }
    },
    yaxis: {
      title: {
        text: yAxisLabel
      },
      labels: {
        formatter: isPercent ? function (value: number) {
          return (value * 100).toString() + "%";
        } : undefined
      }
    },
    stroke: {
      curve: "smooth",
      width: strokeWidth
    },
    title: {
      text: chartLabel,
      align: "center",
      style: {
        fontSize: "18px"
      }
    },
    theme: {
      mode: "light"
    }
  };
}

// Start CavFunding

function parseCsvCavFunding(csvText: string) {

  const { dataRows, categories: cavFundingCategories } = parseCsv(csvText);

  const baseline = {
    name: "Baseline (100%)",
    data: Array(dataRows.length).fill(1)
  };

  const cavFunding = {
    name: "CavFunding",
    data: dataRows.map(row => Number(row[3]))
  };

  const reserve = {
    name: "Reserve",
    data: dataRows.map(row => row[6] === "" ? null : Number(row[6]))
  };

  const cavFundingSeries = [baseline, cavFunding, reserve];

  return { cavFundingCategories, cavFundingSeries };
}

const { cavFundingCategories, cavFundingSeries } = parseCsvCavFunding(rawCsvData);

const cavFundingOptions = buildOptions(cavFundingSeries, cavFundingCategories, "Monthly Donations & Reserves", "Month/Year", "Percentage", [1, 3, 3], true);

postToElement("cavfunding", cavFundingOptions);

// End CavFunding

// Start CAVCON

function parseCsvCavcon(csvText: string) {

  const { dataRows, categories: cavconCategories } = parseCsv(csvText);

  const cavcon = {
    name: "CAVCON",
    data: dataRows.map(row => row[5] === "" ? null : Number(row[5]))
  };

  const cavconSeries = [cavcon];

  return { cavconCategories, cavconSeries };
}

const { cavconCategories, cavconSeries } = parseCsvCavcon(rawCsvData);

const cavconOptions = buildOptions(cavconSeries, cavconCategories, "CAVCON Level Over Time", "Month/Year", "CAVCON Level", 3);

postToElement("cavcon", cavconOptions);

// End CAVCON

// Start Population

function parseCsvPopulation(csvText: string) {

  const { dataRows, categories: populationCategories } = parseCsv(csvText);

  const cavcon = {
    name: "CAVCON",
    data: dataRows.map(row => row[7] === "" ? null : Number(row[7]))
  };

  const totalVisits = {
    name: "Total Visits",
    data: dataRows.map(row => row[9] === "" ? null : Number(row[9]))
  };

  const populationSeries = [cavcon, totalVisits];

  return { populationCategories, populationSeries };
}

const { populationCategories, populationSeries } = parseCsvPopulation(rawCsvData);

const populationOptions = buildOptions(populationSeries, populationCategories, "Population Over Time", "Month/Year", "Population", 3);

postToElement("population", populationOptions);

// End Population

// Start Visits

function parseCsvVisits(csvText: string) {

  const { dataRows, categories: visitsCategories } = parseCsv(csvText);

  const changeInPopulation = {
    name: "Change in Population",
    data: dataRows.map((row, index, array) => {
      if (index === 0) {
        return null;
      }
      const previousRow = array[index - 1];
      const diff = Number(row[7]) - Number(previousRow[7]);
      return diff;
    })
  };

  const uniqueVisits = {
    name: "Unique Visits",
    data: dataRows.map(row => row[8] === "" ? null : Number(row[8]))
  };

  const visitsSeries = [changeInPopulation, uniqueVisits];

  return { visitsCategories, visitsSeries };
}

const { visitsCategories, visitsSeries } = parseCsvVisits(rawCsvData);

const visitsOptions = buildOptions(visitsSeries, visitsCategories, "Monthly Population & Visits", "Month/Year", "Quantity", 3);

postToElement("visits", visitsOptions);

// End Visits