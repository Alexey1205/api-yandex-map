document.getElementById('formHidden').addEventListener('submit', function(evt){
  var http = new XMLHttpRequest(), f = this;
  evt.preventDefault();
  http.open("POST", "form-hidden-process.php", true);
  http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  http.send("&UserNameFormHidden=" + f.UserNameFormHidden.value + "&phoneFormHidden=" + f.phoneFormHidden.value + "&date1FormHidden=" + f.date1FormHidden.value);
  http.onreadystatechange = function() {
    if (http.readyState == 4 && http.status == 200) {
      alert(f.UserNameFormHidden.value + ', Ваше сообщение получено.\nНаши специалисты свяжутся с Вами.\nБлагодарим за обращение!');    
      f.UserNameFormHidden.removeAttribute('value'); // очистить поле сообщения (две строки)
      f.UserNameFormHidden.value='';
      f.date1FormHidden.removeAttribute('value'); // очистить поле сообщения (две строки)
      f.date1FormHidden.value='';
      f.phoneFormHidden.removeAttribute('value'); // очистить поле сообщения (две строки)
      f.phoneFormHidden.value='';
    }
  }
  http.onerror = function() {
    alert('Извините, данные не были переданы');
  }
}, false);



function dopUsviwe (id) {
  document.getElementById('dopuslugi').style.display='block';
};
  function dopUshid(id){
    if (document.getElementById('dopuslugi').style.display='block') {
      document.getElementById('dopuslugi').style.display='none';
    }
    
  };


// function hiddenMap(id) {
//   if (document.getElementById('dopuslugi').style.display='block') {
//     document.getElementById('dopuslugi').style.display='none';
//     document.getElementById('blockMap').style.display=''
//   }
// };


// function viweMap(id) {
// document.getElementById('blockMap').style.display='none';
// document.getElementById('dopuslugi').style.display='block';
// };


// function dopUsviwe(id) {
//     document.getElementById('dopuslugi').style.display = 'block';
//   };

// function dopUshid(id){
//     document.getElementById('dopuslugi').style.display='none'
//   };











ymaps.ready(init);

function init() {


ymaps.ready(['DeliveryCalculator']).then(function init () {
    var myMap = new ymaps.Map('map', {
            center: [59.938951, 30.315635],
            zoom: 10,
            type: 'yandex#map',
            controls: []
        }),
        searchStartPoint = new ymaps.control.SearchControl({
            options: {
                useMapBounds: true,
                noPlacemark: true,
                noPopup: true,
                placeholderContent: 'Откуда',
                size: 'large'
            }
        }),
        searchFinishPoint = new ymaps.control.SearchControl({
            options: {
                useMapBounds: true,
                noCentering: true,
                noPopup: true,
                noPlacemark: true,
                placeholderContent: 'Куда',
                size: 'large',
                float: 'none',
                position: { left: 10, top: 44 }
            }
        }),
        calculator = new ymaps.DeliveryCalculator(myMap);

    myMap.controls.add(searchStartPoint);
    myMap.controls.add(searchFinishPoint);

    searchStartPoint.events
        .add('resultselect', function (e) {
            var results = searchStartPoint.getResultsArray(),
                selected = e.get('index'),
                point = results[selected].geometry.getCoordinates();

            // Задаем начало маршрута.
            calculator.setStartPoint(point);
        })
        .add('load', function (event) {
            // По полю skip определяем, что это не дозагрузка данных.
            // По getResultsCount определяем, что есть хотя бы 1 результат.
            if (!event.get('skip') && searchStartPoint.getResultsCount()) {
                searchStartPoint.showResult(0);
            }
        });

    searchFinishPoint.events
        .add('resultselect', function (e) {
            var results = searchFinishPoint.getResultsArray(),
                selected = e.get('index'),
                point = results[selected].geometry.getCoordinates();

            // Задаем конец маршрута.
            calculator.setFinishPoint(point);
        })
        .add('load', function (event) {
            // По полю skip определяем, что это не дозагрузка данных.
            // По getResultsCount определяем, что есть хотя бы 1 результат.
            if (!event.get('skip') && searchFinishPoint.getResultsCount()) {
                searchFinishPoint.showResult(0);
            }
        });
});





    $("#submstr").click(function () {
     var gfgf = $("#startpoint").val();
     $("#finishpoint").val(gfgf);
     
     
     

    });



ymaps.modules.define(
    'DeliveryCalculator',
    ['util.defineClass'],
    function (provide, defineClass) {
        /**
         * @class DeliveryCalculator Расчет стоимости доставки.
         * @param {Object} map    Экземпляр карты.
         */
        function DeliveryCalculator (map) {
            this._map = map;
            this._startPoint = null;
            this._route = null;
            this._startPointBalloonContent;
            this._finishPointBalloonContent;

            map.events.add('click', this._onClick, this);
        }

        defineClass(DeliveryCalculator, {
            /**
             * Создаем начальную точку маршрута.
             * Если точка создана, то обновляем координаты.
             * @param {Number[]} position Координаты точки.
             */
            setStartPoint: function (position) {
                if (this._startPoint) {
                    this._startPoint.geometry.setCoordinates(position);
                } else {
                    // Создаем маркер с возможностью перетаскивания (опция `draggable`).
                    // По завершении перетаскивания вызываем обработчик `_onStartDragEnd`.
                    this._startPoint = new ymaps.Placemark(position, {iconContent: 'А'}, {draggable: true});
                    this._startPoint.events.add('dragend', this._onStartDragEnd, this);
                    this._map.geoObjects.add(this._startPoint);
                }
                this.geocode('start', position);
            },

            /**
             * Создаем конечную точку маршрута.
             * Если точка создана, то обновляем координаты.
             * @param {Number[]} position Координаты точки.
             */
            setFinishPoint: function (position) {
                if (this._finishPoint) {
                    this._finishPoint.geometry.setCoordinates(position);
                } else {
                    this._finishPoint = new ymaps.Placemark(position, { iconContent: 'Б' }, { draggable: true });
                    this._finishPoint.events.add('dragend', this._onFinishDragEnd, this);
                    this._map.geoObjects.add(this._finishPoint);
                }
                if (this._startPoint) {
                    this.geocode('finish', position);
                }
            },

            /**
             * Проводим обратное геокодирование (определяем адрес по координатам) для точек маршрута.
             * @param {String} pointType Тип точки: 'start' - начальная, 'finish' - конечная.
             * @param {Number[]} point Координаты точки.
             */
            geocode: function (pointType, point) {
                ymaps.geocode(point).then(function (result) {
                    // result содержит описание найденных геообъектов.
                    if (pointType == 'start') {
                        // Получаем описание первого геообъекта в списке, чтобы затем показать
                        // с описанием доставки по клику на метке.
                        this._startPointBalloonContent = result.geoObjects.get(0) &&
                            result.geoObjects.get(0).properties.get('balloonContentBody') || '';
                            
                          var stp = result.geoObjects.get(0).properties.get('name');
                          $("#startpoint").val(stp);  
     
                    } else {
                        // То же самое для конечной точки
                        this._finishPointBalloonContent = result.geoObjects.get(0) &&
                            result.geoObjects.get(0).properties.get('balloonContentBody') || '';
                       var finp = result.geoObjects.get(0).properties.get('name');
                          $("#finishpoint").val(finp);
                    }
                    this._setupRoute();
                }, this);

            },

            /**
             *
             * @param  {Number} routeLength Длина маршрута в километрах.
             * @return {Number} Стоимость доставки.
             */
            calculate: function (routeLength) {
                // Константы.
                var DELIVERY_TARIF = 23, // Стоимость за километр.
                    MINIMUM_COST = 890; // Минимальная стоимость.

                return Math.max(routeLength * DELIVERY_TARIF, MINIMUM_COST);
            },

            /**
             * Прокладываем маршрут через заданные точки
             * и проводим расчет доставки.
             */
            _setupRoute: function () {
                // Удаляем предыдущий маршрут с карты.
                if (this._route) {
                    this._map.geoObjects.remove(this._route);
                }

                if (this._startPoint && this._finishPoint) {
                    var start = this._startPoint.geometry.getCoordinates(),
                        finish = this._finishPoint.geometry.getCoordinates(),
                        startBalloon = this._startPointBalloonContent,
                        finishBalloon = this._finishPointBalloonContent;

                    // Прокладываем маршрут через заданные точки.
                    ymaps.route([start, finish])
                        .then(function (router) {
                            var distance = Math.round(router.getLength() / 1000),
                            timedist = router.getHumanJamsTime(),
                                message = '<span>Расстояние: ' + distance + 'км.</span><br/>' +  '<span>Приблизительное время: ' + timedist + '</span><br/>' +
                                    '<span style="font-weight: bold; font-style: italic">Цена: %sруб.</span>';

                            this._route = router.getPaths(); // Получаем коллекцию путей, из которых состоит маршрут.

                            this._route.options.set({ strokeWidth: 5, strokeColor: '0000ffff', opacity: 0.5 });
                            this._map.geoObjects.add(this._route); // Добавляем маршрут на карту.
                            // Задаем контент балуна для начального и конечного маркера.
                            this._startPoint.properties.set('balloonContentBody', startBalloon + message.replace('%s', this.calculate(distance)));
                            this._finishPoint.properties.set('balloonContentBody', finishBalloon + message.replace('%s', this.calculate(distance)));

                            // Открываем балун над точкой доставки.
                            // Закомментируйте, если не хотите показывать балун автоматически.
                           this._finishPoint.balloon.open();
                        }, this);

                    this._map.setBounds(this._map.geoObjects.getBounds());
                }
            },

            /**
             * Обработчик клика по карте. Получаем координаты точки на карте и создаем маркер.
             * @param  {Object} event Событие.
             */
            _onClick: function (event) {
                if (this._startPoint) {
                    this.setFinishPoint(event.get('coords'));
                } else {
                    this.setStartPoint(event.get('coords'));
                }
            },

            /**
             * Получаем координаты маркера и вызываем геокодер для начальной точки.
             */
            _onStartDragEnd: function () {
                this.geocode('start', this._startPoint.geometry.getCoordinates());
            },

            _onFinishDragEnd: function () {
                this.geocode('finish', this._finishPoint.geometry.getCoordinates());
            }
        });

        provide(DeliveryCalculator);
    }
);
};


















function fun1(valNum) {
  var rem1, rem2, rem3, result;




  rem1 = document.getElementById("cbx1");
  if (rem1.checked) {
    rem1 = 700;
  }
  else {
    rem1 = 0;
  }
  rem1 = parseInt(rem1*1);






  rem2 = document.getElementById("cbx2");
  if (rem2.checked) {
    rem2 = 500;
  }
  else {
    rem2 = 0;
  }
  rem2 = parseInt(rem2*1);







  rem3 = document.getElementById("cbx3");
  if (rem3.checked) {
    rem3 = 500;
  }
  else {
    rem3 = 0;
  }
  rem3 = parseInt(rem3*1);



rem4 = document.getElementById("cbx4");
  if (rem4.checked) {
    rem4 = 500;
  }
  else {
    rem4 = 0;
  }
  rem4 = parseInt(rem4*1);






  result = rem1 + rem2 + rem3 + rem4;

  document.getElementById("result").innerHTML = result;

}