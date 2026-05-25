$(document).ready(function () {
    const url = 'http://172.34.11.117:8000/'
    $.ajax({
        method: "GET",
        url: `${url}api/v1/dashboard/address-chart`,
        dataType: "json",
        success: function (data) {
            // console.log(data);
            const { values, labels } = data
            console.log(values, labels)
            var ctx = $("#addressChart");

            new Chart(ctx, {
                type: 'bar',
                data: {
                    // labels: ['taguig', 'tenment']
                    labels: labels,
                    datasets: [{
                        label: 'Number of Customers per town',
                        data: values,
                        backgroundColor: () => {
                            //generates random colours and puts them in string

                            var colors = [];
                            for (var i = 0; i < values.length; i++) {
                                var letters = '0123456789ABCDEF'.split('');
                                var color = '#';
                                for (var x = 0; x < 6; x++) {
                                    color += letters[Math.floor(Math.random() * 16)];
                                }
                                colors.push(color);
                            }
                            return colors;
                        },
                        borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                        ],
                        borderWidth: 1,

                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    // indexAxis: 'y',
                },
            });
        },
        error: function (error) {
            console.log(error);
        }
    });

    $.ajax({
        type: "GET",
        url: `${url}api/v1/dashboard/sales-chart`,
        dataType: "json",
        success: function (data) {
            console.log(data);
            const { values, labels } = data
            var ctx = $("#salesChart");
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Monthly sales',
                        data: values,
                        backgroundColor: () => {
                            //generates random colours and puts them in string

                            var colors = [];
                            for (var i = 0; i < values.length; i++) {
                                var letters = '0123456789ABCDEF'.split('');
                                var color = '#';
                                for (var x = 0; x < 6; x++) {
                                    color += letters[Math.floor(Math.random() * 16)];
                                }
                                colors.push(color);
                            }
                            return colors;
                        },

                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                },
            });

        },
        error: function (error) {
            console.log(error);
        }
    });

    $.ajax({
        type: "GET",
        url: `${url}api/v1/dashboard/items-chart`,
        dataType: "json",
        success: function (data) {
            console.log(data);
            const { values, labels } = data
            var ctx = $("#itemsChart");
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels,
                    datasets: [{
                        label: 'number of items sold',
                        data: values,

                        backgroundColor: () => {
                            //generates random colours and puts them in string

                            var colors = [];
                            for (var i = 0; i < values.length; i++) {
                                var letters = '0123456789ABCDEF'.split('');
                                var color = '#';
                                for (var x = 0; x < 6; x++) {
                                    color += letters[Math.floor(Math.random() * 16)];
                                }
                                colors.push(color);
                            }
                            return colors;
                        },
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255,99,132,1)'
                        ],
                        borderWidth: 1,
                        responsive: true,
                        // hoverBackgroundColor: colors,
                    }]
                },
                options: {
                    plugins: {
                        datalabels: {
                            backgroundColor: function (context) {
                                return context.dataset.backgroundColor;
                            },
                            borderColor: 'white',
                            borderRadius: 25,
                            borderWidth: 2,
                            color: 'white',
                            display: function (context) {
                                var dataset = context.dataset;
                                var count = dataset.data.length;
                                var value = dataset.data[context.dataIndex];
                                return value > count * 1.5;
                            },
                            font: {
                                weight: 'bold'
                            },
                            padding: 6,
                            formatter: Math.round
                        },
                        aspectRatio: 4 / 3,
                        cutoutPercentage: 32,
                        layout: {
                            padding: 32
                        },
                        elements: {
                            line: {
                                fill: false
                            },
                            point: {
                                hoverRadius: 7,
                                radius: 5
                            }
                        },
                    }
                }


            });

        },
        error: function (error) {
            console.log(error);
        }
    });
})