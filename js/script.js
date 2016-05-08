
    var n, m, l, T, a;

    $('#submit').click(function() {
        create();
    });

    $(document).ready(function() {
        drawRod();
    });


    Array.matrix = function(dx, dt, init) {
        matr = [];
        for (var i = 0; i < dt; i++) {
            var tmp = [];
            for (var j = 0; j < dx; j++) {
                tmp[j] = init;
            }
            matr[i] = tmp;
        }
        return matr;
    };

    function create() {

        n = parseInt($('#n').val()) + 1;
        m = parseInt($('#m').val()) + 1;
        l = parseInt($('#l').val());
        T = parseInt($('#T').val());
        a = parseFloat($('#a').val());
        ms = parseInt($('#ms').val());

        dx = l / (n - 1);
        dt = T / (m - 1);

		//проверка условий
        if (dt > (dx / 2) * a*a) {
            alert("Введите корректные данные!");
            return;
        }

        matrix = Array.matrix(n, m, 0);

		//g(x)
        for (i = 0, j = 0; i <= l; i += dx, j++) {
            matrix[0][j] = (g(i));
        }
		//a(t)
        for (i = 0, j = 0; j < m; i += dt, j++) {
            matrix[j][0] = (alpha(i));
        }
		//b(t)
        for (i = 0, j = 0; j < m; i += dt, j++) {
            matrix[j][n - 1] = (beta(i));
        }

		//неявный метод
        if (window.location.pathname == "/heat-model/explicit.html") {

            for(i = 1; i < m ; i++) {

                var A = Array.matrix(n, n, 0);
                var B = [];
                A[0][0] = 1;
                A[n - 1][n - 1] = 1;
                B[0] = matrix[i][0];
                B[n - 1] = matrix[i][n - 1];

                var offset = 0;

                for(j = 1; j < n - 1; j++) {
                    A[j][offset] = -dt;
                    A[j][offset + 1] = dx*dx + 2;
                    A[j][offset + 2] = -dt;
                    B[j] = /*dx*dx * */matrix[i - 1][j];
                    offset++;
                }

                var X = numeric.solve(A,B);

                for(j = 0; j < n; j++) {
                    matrix[i][j] = X[j];
                }
            }
        }
		
		//явный метод
        else {

            for (t = 0; t < m - 1; t++) {
                for (x = 1; x < n - 1; x++) {
                    matrix[t + 1][x] = (matrix[t][x] + ((a * a * dt) / dx * dx) * (matrix[t][x + 1] - 2 * matrix[t][x] + matrix[t][x - 1]) + dt * f(t, x));
                }
            }
        }


        drawTemperature();
		writeMatrix();
    }

    
    function f(x, t) {
        return Math.exp(-(x*x));
        //return 0;
    }
    function alpha (x) {
        return 15 / (x + 15) + 5*x;
    }
    function beta (t) {
        return g(l);
    }
    function g (x) {
        return 1 / (x + 1) + 2*x;
    }

    function drawRod () {
        var c = document.getElementById('can');
        var can = $('#can');
        var cx = c.getContext("2d");

        var cW = can.prop('width');
        var cH = can.prop('height');
        var h = 100;
        var w = 600;
        var top = 30;
    }

    function drawTemperature () {
        var h = 100;
        var w = 600;
        var top = 30;

        var min = getMin();
        var max = getMax();

        var colors = Array.matrix(3, 665, 0);

        var start = 0, end = 665, center = 150, maxC = 255;

		//заполение матрицы температур значениями от синего до красного в формате RGB
        for (i = start, j = maxC; i < maxC - center; i++, j--) {
            colors[i][0] = 0;
            colors[i][1] = 0;
            colors[i][2] = j;
        }
        for (i = maxC - center, j = center; i < maxC; i++, j--) {
            colors[i][0] = center - j;
            colors[i][1] = 0;
            colors[i][2] = j;
        }
        for (i = maxC, j = center; i < end; i++, j++) {
            colors[i][0] = j;
            colors[i][1] = 0;
            colors[i][2] = 0;
        }
		

        var d = (end - 1) / (max - min);
        var dTemp = 1 / (n - 1);
        var al = "";
        var tmpT = 0;

        var timerId = setInterval(function() {
            if (tmpT == m - 1) {
                clearInterval(timerId);
            }

            var c = document.getElementById('can');
            var can = $('#can');
            var cx = c.getContext("2d");
            var cW = can.prop('width');
            var cH = can.prop('height');

            var gr = cx.createLinearGradient(cW / 2 - w / 2, top + h / 2, cW / 2 + w / 2, top + h / 2);

            var tmp;

            /*min = getMin(tmpT);
            max = getMax(tmpT);*/

            for (i = 0; i < n; i++) {

                tmp = Math.floor(end * (matrix[tmpT][i] / (max + min)));

                gr.addColorStop(i * dTemp, "rgb(" + colors[tmp][0] + "," + colors[tmp][1] + "," + colors[tmp][2] + ")");

            }

            cx.fillStyle = gr;
            cx.fillRect(cW / 2 - w / 2, top /*+ (110 * tmpT)*/, w, h);

			$('#t' + tmpT).css('background', '#bbb');

            tmpT++;
        }, ms);
    }

    function getMin () {

        var min = 99999;

            for (i = 0; i < m; i++) {
                for (j = 0; j < n; j++) {
                    if (matrix[i][j] < min) {
                        min = matrix[i][j];
                    }
                }
            }
        

        return min;
    }

    function getMax () {

        var max = -99999;

            for (i = 0; i < m; i++) {
                for (j = 0; j < n; j++) {
                    if (matrix[i][j] > max) {
                        max = matrix[i][j];
                    }
                }
            }

        return max;
    }

	function writeMatrix() {
		
		var matr = $('#matrix');
		var str = "";
		
		str += "<table>";
		
		for (i = 0; i < m; i++) {
			str += "<tr id='t" + i + "'><td>t = " + i + "</td>";
			for (j = 0; j < n; j++) {
		
				str += "<td>";
				
				var tm = Math.floor(matrix[i][j] * 100000) / 100000;
		
				str += tm + "</td>";
			}
			str += "</tr>";
		}
		
		str += "</table>";
		
		matr.html(str);
	}
	
	
	
	
	
	
	
	
	
	
	
	
	


