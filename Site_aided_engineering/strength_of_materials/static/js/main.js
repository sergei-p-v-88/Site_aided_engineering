//функция рисования линии
var line_draw = function(start_point, end_point, context){
    context.beginPath();
    context.moveTo(start_point.x, start_point.y);
    context.lineTo(end_point.x, end_point.y);
    context.stroke();
}

//функция рисования линии по координатам конечной точки
var line_draw_end_coordinates = function(start_point, coordinates, context){
    context.beginPath();
    context.moveTo(start_point.x, start_point.y);
    context.lineTo(coordinates[0], coordinates[1]);
    context.stroke();
}

//получить угол наклона линнии
var inclination_line = function(start_point, end_point){
    return  Math.atan((end_point.y - start_point.y) / (end_point.x - start_point.x))
}

//функция рисования вектора
var vector_draw = function(start_point, end_point, context){
    line_draw(start_point, end_point, context);
    let alfa = inclination_line(start_point, end_point);
    let betta = 30 * (180 / Math.PI);
    let l = Math.sign(end_point.x - start_point.x) * style_canvas.base_height / Math.cos(betta);
    line_draw_end_coordinates(start_point, [start_point.x + l * Math.cos(alfa + betta), start_point.y + l * Math.sin(alfa + betta)], context);
    line_draw_end_coordinates(start_point, [start_point.x + l * Math.cos(alfa - betta), start_point.y + l * Math.sin(alfa - betta)], context);
}


//функция вычисляющее расстояние между двумя точками
var get_distance = function(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

//найти решение у линенейного уравнения проходящего через 2 точки
var linear_equation = function(start_point, end_point, x){
    return (start_point.y - end_point.y) / (start_point.x - end_point.x) * (x - end_point.x) + end_point.y;
}

//bool - принадлежит ли точка линни
var check_line = function(start_point, end_point, x, y){
    //угола наклона линии
    let alfa = inclination_line(start_point, end_point);
    //console.log("Alfa: " + alfa);
    //нахождение координаты y точки лежащей на прямой
    let y0 = linear_equation(start_point, end_point, x);
    //console.log("Решение: "+ y0.toFixed(4))
    let x_min = start_point.x;
    let x_max = end_point.x;
    if (x_min > x_max){
        x_min = end_point.x;
        x_max = start_point.x;
    }
    x_min -= style_canvas.distance_choice*Math.abs(Math.cos(alfa));
    x_max += style_canvas.distance_choice*Math.abs(Math.cos(alfa));
    let y_min = y0 - style_canvas.distance_choice/Math.abs(Math.cos(alfa));
    let y_max = y0 + style_canvas.distance_choice/Math.abs(Math.cos(alfa));
    //console.log("x_min" + x_min.toFixed(4) + ", x_max " + x_max.toFixed(4) + ", y_min " + y_min.toFixed(4) + ", y_max" + y_max.toFixed(4));
    if (x >= x_min && x <= x_max){
        //console.log("X подходит");
        if (y >= y_min && y <= y_max){
            return true;
        }    
    }
    return false;
}

//оформление канвас
var style_canvas = {
    line_width: 3,//базовая ширина линии
    radius_point: 5,//радиус точки для рисования
    distance_choice: 4,//дистанция выбора
    font_size: 10,//размер шрифта для печати
    base_height: 10,//базовая высота элемента
    colors : ["red", "black", "silver", "gray", "orange"]
};

class Model{//класс схема 
	constructor(id, width, height){//конструктор
		//канвас
		this.id = id;
		this.canvas = document.getElementById(id);
		this.context = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
		//данные
        this.elements = [];//элементы
        this.temp_obj = [];//временный объкт для создания
		//выбранные элементы
		this.aim_element = null;//элемент на который наведен курсор
		this.selected_element = null;//элемент на который выбран нажатием на клавишу
		this.rectangular_drawing = false;//прямоугольное черчение
	}

    get_data(){//получение элементов в виде списка
        let data = []
        for (let i = 0; i < this.elements.length; i++){
            if (this.elements[i].constructor.name != 'Point'){
                let element = this.elements[i].get_data();
                element["name"] = this.elements[i].constructor.name;
                data.push(element)
            }
        }
        return data
    }

    set_data(data){
        return;
    }

    set_color(obj){//установка цветов при рисовании
        if(obj == this.selected_element){//элемент выбран шелчком мышки
            return style_canvas.colors[3];
        } else if (obj == this.aim_element){//на элемент наведена мышка
            //console.log("цвет наведено")
            return style_canvas.colors[2];
        } else if(obj.check){//если в объекте ощибка
            return style_canvas.colors[0];
        } else if(obj.constructor.name == "Centerline"){
            return style_canvas.colors[4];//цвет осевой
        } else {
            return style_canvas.colors[1];//все ОК
        }
    }

    set_lineWidth(obj){//установка толщины линии при рисовании
        if (obj.constructor.name == 'Beam'){
            return style_canvas.line_width;
        }else if(obj.constructor.name == 'Hard_connection'){
            return style_canvas.line_width * 1,5;
        }else{
            return style_canvas.line_width / 2;
        }
    }

    add(obj){//добавление нового элемента
        if (this.elements.indexOf(obj) == -1){//если этого объекта еще там нет
            if (obj.constructor.name == 'Point'){
                this.elements.push(obj);
            }else{
                this.elements.unshift(obj);
            }

        }
        for (const [key, value] of Object.entries(obj.parents)){
            if(obj.parents[key].children.indexOf(obj) == -1){//если этого объекта еще там нет
                obj.parents[key].children.push(obj);
            }
            this.add(obj.parents[key]);
        }
    }

    del(obj){//удаление элемента
        if(obj.children.length == 0){//удаление элемента
            //console.log("У элемента с номером: " + obj.number + ", типом: " + obj.constructor.name + "нет детей");
            //перебираем его родителей
            for (const [key, value] of Object.entries(obj.parents)){
                //console.log("Удаляем запись в родителе: " + key);
                obj.parents[key].children.splice(obj.parents[key].children.indexOf(obj), 1);//удаляем запись в родителях объекта
                //едаляем родителей точек у которых уже нет детей
                if (obj.parents[key].constructor.name == 'Point' && obj.parents[key].children.length == 0){
                    //console.log("Удаляем точку с номером: " + obj.parents[key].number);
                    this.del(obj.parents[key]);
                }
            }
            //console.log("Удаление элемента: номер:" + obj.number + ", тип: " + obj.constructor.name);
            this.elements.splice(this.elements.indexOf(obj), 1);//удаляем элемент из списка элементов
            return;
        }
        //перебираем его детей
        while(obj.children.length > 0){
            this.del(obj.children[0]);
        }
        if(this.elements.indexOf(obj) != -1){
            this.del(obj);
        }
    }

    draw_temp(obj){
        if (obj != null){
            this.context.strokeStyle = this.set_color(obj);
            this.context.fillStyle = this.set_color(obj);
            this.context.lineWidth = this.set_lineWidth(obj);
            this.context.textAlign = "center";//выводит текст по середине
            this.context.textBaseline = "botton";//выше направляющей линии
            this.context.font = style_canvas.font_size +"pt Arial"
            obj.draw(this);
            for (const [key, value] of Object.entries(obj.parents)){
                this.draw_temp(obj.parents[key]);
            }
        }
    }

    draw_field(){//метод рисования поля
        //console.log("Метод рисования поля");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);//очистка поля
        //рисование элементов
        for (let i = 0; i < this.elements.length; i++){
            this.context.strokeStyle = this.set_color(this.elements[i]);
            this.context.fillStyle = this.set_color(this.elements[i]);
            this.context.lineWidth = this.set_lineWidth(this.elements[i]);
            this.context.textAlign = "center";//выводит текст по середине
            this.context.textBaseline = "botton";//выше направляющей линии
            this.context.font = style_canvas.font_size +"pt Arial";
            this.elements[i].draw(this);
        }
        //рисование временных элементов
        for (let j = 0; j < this.temp_obj.length; j++){
            this.draw_temp(this.temp_obj[j]);
        }
    }

    get_mouse_position(){
        let x_otn = event.pageX - this.canvas.getBoundingClientRect().x;
        let y_otn = event.pageY - this.canvas.getBoundingClientRect().y;
        return [x_otn, y_otn];
    }

    clear(){
        this.elements = [];
        this.draw_field();
    }

    create_element(type){

        if (type == 'Centerline'){
            this.temp_obj.push(new Centerline());
        }else if(type == 'Beam'){
            this.temp_obj.push(new Beam());
        }else if(type == 'Hard_connection'){
            this.temp_obj.push(new Hard_connection());
        }else if(type == 'Size'){
            this.temp_obj.push(new Size());
        }else if(type == 'Force'){
            this.temp_obj.push(new Force());
        }else{
            this.temp_obj.push(new Point());
        }
    }
}

var WORKER= null;//рабочий кликов
var COUNTER = 0;//счеткик создания новых элементов

//классы взаимодействий с пользователем
class Controller{
    constructor(model){
        this.model = model;
        addEventListener("keydown", this.keydown.bind(this));
        document.addEventListener('click', this.click.bind(this));
        document.addEventListener('mousemove', this.move.bind(this));
        this.workers = {
        'base': new Worker_base(this),
        'create': new Worker_create_element(this)
        };
        WORKER = this.workers['base'];
    }

    exit_operation(){
        console.log("Отмена операции");
        //console.log(this.temp_obj);
        this.model.selected_element = null;
        this.model.aim_element = null;
        this.model.temp_obj = [];
        WORKER = this.workers['base'];
        this.model.draw_field();
    }

    keydown(){//отслеживания нажатия на клавиатуру
        console.log("Код нажатой клавиши: " + event.keyCode);
        //удаление элемента
        if (event.keyCode == 46){//клавиша del - удаление выбранного элемента
            console.log("Нажата DEL");
            if (this.model.selected_element != null){
                this.model.del(this.model.selected_element);
                this.model.draw_field();
                this.exit_operation();
            }
        }else if(event.keyCode == 27){//esc - отмена операции
            this.exit_operation();
        }
    }

    click(e){//отслеживание нажатия кнопку мыши
        WORKER.click(e);
    }

    move(){//отслеживание перемещение мыши
        WORKER.move();
    }

    add_temp(){
        this.model.add(model.temp_obj[0]);
        this.model.temp_obj = [];
    }

    create_element(type){
        this.model.create_element(type);
    }
}

//базовый рабочий отлеживающий наведение и выделение элементов
class Worker_base{
    constructor(controller){
        this.controller = controller;
        this.model = controller.model;
    }
    //отслеживание кликов
    click(e){
        console.log(this.model);
        console.log(this.model.get_data());
        //console.log(e.target.id);
        console.log("Рабочий: " + WORKER.constructor.name);
        this.model.draw_field();
        if(e.target.id == this.model.id){//если кликнуто по канвасу
            let x_otn = this.model.get_mouse_position()[0];
            let y_otn = this.model.get_mouse_position()[1];
            if (this.model.selected_element != null && this.model.aim_element == null){
                this.model.selected_element = null;
                this.model.draw_field();
            }
            if (this.model.aim_element != null){
                this.model.selected_element = this.model.aim_element;
                this.model.draw_field();
            }
        }else if(e.target.className == "operations"){//если нажато на кнопки с названием класса Операции
            if (e.target.id == "clear_scheme"){
                this.model.clear();
                this.controller.exit_operation();
            }else{
                //запускаем рабочего создающего элементы
                WORKER = this.controller.workers['create'];
                this.controller.create_element(e.target.id);
                if (e.target.id == 'Hard_connection' || e.target.id == 'Size'){
                    WORKER.create_new_point = false;
                }else{//типы для которых разрешено создавать новые точки
                    WORKER.create_new_point = true;
                }
            }
        }
    }
    //отслеживание перемещения мыши
    move(){
        let x_otn = this.model.get_mouse_position()[0];
        let y_otn = this.model.get_mouse_position()[1];
        //console.log("Перемещаем мышку, X:" + x_otn + "Y:" + x_otn);
        for (let i = 0; i < this.model.elements.length; i++){
            if (this.model.elements[i] == this.model.selected_element){//если текущий элемент выбранный
                continue;
            }else if(this.model.elements[i].check_selection(x_otn, y_otn)){//если наведено на этот элемент
                if(this.model.elements[i] == this.model.aim_element){
                    break;
                }else if(this.model.aim_element == null){
                    this.model.aim_element = this.model.elements[i];
                    //console.log("Наведено на элемента с номером: " + this.model.aim_element.number + ", тип элемента: " + this.model.aim_element.constructor.name)
                    this.model.draw_field();
                    break;
                }
            }else{
                if (this.model.aim_element != null){
                        this.model.aim_element = null;//поменять статус на не неведено
                        this.model.draw_field();
                        }
            }
        }
    }
}

//рабочий создающий элементы
class Worker_create_element extends Worker_base{
    click(e){
        super.click(e);
        this.model.temp_obj[0].add_parent(this.model);
        if (this.model.temp_obj[0].isFull()){//елемент геометрически определен
            WORKER = this.controller.workers['base'];
            this.controller.add_temp();
        }
        this.model.draw_field();
        //
    }
    move(){
        super.move();
        this.model.draw_field();
    }
}

//классы элементов
class Point{//класс точка
	constructor(){
		this.x = null;
		this.y = null;
		this.check = false;
        this.radius = style_canvas.radius_point;
        this.parents = {};
        this.children = [];

        COUNTER += 1;
        this.number = COUNTER;
	}
    get_data(){
        return {"x": this.x, "y": this.y}
    }

    set_coordinates(x_y){
        this.x = x_y[0];
        this.y = x_y[1];
    }

    get_coordinates(){
        return [this.x, this.y];
    }

	draw(model){//метод рисования точки
	    //console.log("Рисуем точку");
	    if(this.isFull()){
	        //console.log("Рисование точки");
		    model.context.beginPath();
		    model.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
		    model.context.fill();
	    }
	}

	isFull(){
	    return this.x != null && this.y != null;
	}

    check_selection(x, y){//проверка наведения
        //console.log("Проверка точки");
        if (get_distance(this.x, this.y, x, y) <= 2*style_canvas.distance_choice){
            return true;
        }
        return false; 
    }
    find_children(name){
        for (let i = 0; i < this.children.length; i++){
            if(this.children[i].constructor.name == name){
                return i;
            }
        }
        return -1;
    }
}

//класс осевая
class Centerline{
    constructor(){
        this.check = false;
        this.parents = {'Start_point' : null, 'End_point' : null};//точки
        this.children = [];

        COUNTER += 1;
        this.number = COUNTER;
    }

    get_data(){
        let data = {};
        data["Start_point"] = this.parents["Start_point"].get_data();
        data["End_point"] = this.parents["End_point"].get_data();
        return data;
    }

    add_parent(model){
        console.log("Добавление родителя осевой /n модедь:" + model);
        let obj = model.selected_element;
        if(obj != null && obj.constructor.name == 'Point'){
            console.log("Добавление существующей точки")
        }
        if (obj != null && obj.constructor.name != 'Point'){
            return;
        }
        if(obj == null){
            console.log("Создание новой точки")
            obj = new Point();
            obj.set_coordinates(model.get_mouse_position());
        }
        if (this.parents['Start_point'] == null){
            this.parents['Start_point'] = obj;
        }else{
            if(model.rectangular_drawing){
                this.parents['End_point'] = obj;
                this.parents['End_point'].y = this.parents['Start_point'].y;
            }else{
                this.parents['End_point'] = obj;
            }
        }
    }

    isFull(){
        return (this.parents['Start_point'] != null && this.parents['End_point'] != null);
    }

    draw(model){
        //console.log("Рисуем осевую");
        if(this.isFull()){
            line_draw(this.parents['Start_point'], this.parents['End_point'], model.context);
        }else if(this.parents['Start_point'] != null && this.parents['End_point'] == null){
            if(model.rectangular_drawing){
                line_draw_end_coordinates(this.parents['Start_point'], [model.get_mouse_position()[0], this.parents['Start_point'].y], model.context);
            }else{
                line_draw_end_coordinates(this.parents['Start_point'], model.get_mouse_position(), model.context);
            }
        }
    }

    check_selection(x, y){
        return check_line(this.parents['Start_point'], this.parents['End_point'], x, y);
    }

    get_inclination(){//получить угол наклона осевой
        return inclination_line(this.parents['Start_point'], this.parents['End_point']);
    }

    find_children(name){//получить индекс первого ребенка по имени
        for (let i = 0; i < this.children.length; i++){
            if(this.children[i].constructor.name == name){
                return i;
            }
        }
        return -1;
    }

    point_on_line(point){//проверка принадлежит ли точка линии
        let y_min = this.parents['Start_point'].y;
        let y_max = this.parents['End_point'].y;
        if(y_min > y_max ){
            y_min = this.parents['End_point'].y;
            y_max = this.parents['Start_point'].y;
        }
        if(point.y == linear_equation(this.parents['Start_point'], this.parents['End_point'], point.x) && (y_min <= point.y <= y_max)){
            return true;
        }
        return false;
    }
}

//класс балка
class Beam{
    constructor(){
        this.check = false;
        this.parents = {'Centerline' : null, 'Point' : null};
        this.children = [];
        this.height = 0;

        COUNTER += 1;
        this.number = COUNTER;
        this.draw_points = [new Point(), new Point(), new Point(), new Point()];
    }

    get_data(){
        let data = {};
        data["Centerline"] = this.parents['Centerline'].get_data();
        data["Point"] = this.parents['Point'].get_data();
        return data;
    }

    add_parent(model){//метод добавления родителя
        let obj = model.selected_element;
        if(obj != null){
            if (obj.constructor.name != 'Point' && obj.constructor.name != 'Centerline'){
                console.log("Выход3" + obj.constructor.name);
                return;
            }
        }
        if (obj == null){
            console.log("Создание новой точки")
            obj = new Point();
            obj.set_coordinates(model.get_mouse_position());
        }
        if (obj.constructor.name == 'Centerline'){
            this.parents['Centerline'] = obj;
        }else if(obj.constructor.name == 'Point'){
            if (this.parents['Centerline'] == null){
                console.log("Создание новой цент линии")
                this.parents['Centerline'] = new Centerline();
                this.parents['Centerline'].add_parent(model);
            }else if(this.parents['Centerline'] != null && !this.parents['Centerline'].isFull()){

                this.parents['Centerline'].add_parent(model);
            }else if(this.parents['Point'] == null && this.parents['Centerline'].isFull()){
                this.parents['Point'] = obj;
            }
        }
    }

    isFull(){//проверка определен ли элемента
        if(this.parents['Centerline'] == null || this.parents['Point'] == null){
            return false;
        }
        return (this.parents['Centerline'].isFull() && this.parents['Point'].isFull());
    }

    get_inclination(){//получения угла наклона
        return this.parents['Centerline'].get_inclination();
    }

    set_draw_points(model){//метод уставки точек для рисования
        //this.parents['Point'].radius = 0;
        let first_point = this.parents['Centerline'].parents['Start_point'];
        let second_point = this.parents['Centerline'].parents['End_point'];
        let alfa = this.get_inclination();
        let betta = Math.atan((second_point.y - model.get_mouse_position()[1]) / (second_point.x - model.get_mouse_position()[0]));
        let b = get_distance(second_point.x, second_point.y , model.get_mouse_position()[0], model.get_mouse_position()[1]);
        //если балка уже полна
        if (this.isFull()){
            betta = Math.atan((second_point.y - this.parents['Point'].y) / (second_point.x - this.parents['Point'].x));
            b = get_distance(second_point.x, second_point.y , this.parents['Point'].x, this.parents['Point'].y);
            this.parents['Point'].radius = 0;
        }
        this.height = b * Math.sin(betta - alfa);
        this.draw_points[0].set_coordinates([first_point.x + this.height * Math.sin(alfa), first_point.y - this.height * Math.cos(alfa)]);
        this.draw_points[1].set_coordinates([second_point.x + this.height * Math.sin(alfa), second_point.y - this.height * Math.cos(alfa)]);
        this.draw_points[2].set_coordinates([second_point.x - this.height * Math.sin(alfa), second_point.y + this.height * Math.cos(alfa)]);
        this.draw_points[3].set_coordinates([first_point.x - this.height * Math.sin(alfa), first_point.y + this.height * Math.cos(alfa)]);
    }

    draw(model){//метод рисования
        if (this.parents['Centerline'] != null && this.parents['Centerline'].isFull()){
            //console.log("Рисуем балку");
            this.set_draw_points(model);
            for (let i = 0; i < this.draw_points.length - 1; i++){
                    line_draw(this.draw_points[i], this.draw_points[i + 1], model.context);
            }
            line_draw(this.draw_points[this.draw_points.length - 1], this.draw_points[0], model.context);
        }
    }

    check_selection(x, y){//проверка наведения на элемента
        return check_line(this.draw_points[3], this.draw_points[2], x, y) || check_line(this.draw_points[0], this.draw_points[1], x, y);
    }
}

//жесткая заделка
class Hard_connection{
    constructor(){
        this.check = false;
        this.parents = {'Centerline' : null, 'Point' : null};
        this.children = [];
        this.height = style_canvas.base_height;

        COUNTER += 1;
        this.number = COUNTER;
        this.draw_points = [new Point(), new Point()];
    }

    get_data(){
        let data = {};
        data["Centerline"] = this.parents['Centerline'].get_data();
        data["Point"] = this.parents['Point'].get_data();
        return data;
    }

    add_parent(model){//метод добавления родителя
        let obj = model.selected_element;
        if (obj != null){
            if (obj.constructor.name == 'Centerline'){
                this.parents['Centerline'] = obj;
            }else if(obj.constructor.name == 'Point'){
                if (obj.find_children('Centerline') != -1){//проверяем есть ли у точки дети осевые
                    this.parents['Point'] = obj;
                }
            }
        }
    }

    isFull(){//проверка определен ли элемента
        if(this.parents['Centerline'] == null || this.parents['Point'] == null){
            return false;
        }
        return (this.parents['Centerline'].isFull() && this.parents['Point'].isFull());
    }

    set_draw_points(model){//метод уставки точек для рисования
        let x;
        let y;
        let alfa;
        if (this.parents['Centerline'] != null){//если осевая определена
            let first_point = this.parents['Centerline'].parents['Start_point'];
            let second_point = this.parents['Centerline'].parents['End_point'];
            if(this.parents['Centerline'].find_children('Beam') != -1){//если у осевой есть ребенок балка то возмем ширину от туда
                this.height = Math.abs(this.parents['Centerline'].children[this.parents['Centerline'].find_children('Beam')].height) + style_canvas.base_height;
            }else{
                this.height = style_canvas.base_height;
            }
            alfa = this.parents['Centerline'].get_inclination();
            x = model.get_mouse_position()[0]
            y = linear_equation(first_point, second_point, x);//координата y лежащая на осевой
        }
        if (this.parents['Point'] != null){
            x = this.parents['Point'].x;
            y = this.parents['Point'].y;
            if(this.parents['Centerline'] == null){
                alfa = Math.atan((model.get_mouse_position()[1] - this.parents['Point'].y) / (model.get_mouse_position()[0] - this.parents['Point'].x))
            }
        }
        this.draw_points[0].set_coordinates([x + this.height * Math.sin(alfa), y - this.height * Math.cos(alfa)]);
        this.draw_points[1].set_coordinates([x - this.height * Math.sin(alfa), y + this.height * Math.cos(alfa)]);
    }

    draw(model){//рисование
        if (this.parents['Centerline'] != null || this.parents['Point'] != null){
            this.set_draw_points(model);
            line_draw(this.draw_points[0], this.draw_points[1], model.context);
        }
    }

    check_selection(x, y){
        if ((get_distance(this.draw_points[0].x, this.draw_points[0].y, x, y) <= 2*style_canvas.distance_choice) || (get_distance(this.draw_points[1].x, this.draw_points[1].y, x, y) <= 2*style_canvas.distance_choice)){
            return true;
        }
        return false;
    }
}

//класс размер
class Size{
    constructor(){
        this.check = false;
        this.parents = {'Centerline': null, 'Start_point' : null, 'End_point' : null, 'Point' : null};
        this.children = [];
        this.height = style_canvas.base_height;

        COUNTER += 1;
        this.number = COUNTER;
        this.draw_points = [new Point(), new Point(), new Point()];
    }

    get_data(){
        let data = {};
        data["Centerline"] = this.parents['Centerline'].get_data();
        data["Start_point"] = this.parents['Start_point'].get_data();
        data["End_point"] = this.parents['End_point'].get_data();
        data["Point"] = this.parents['Point'].get_data();
        return data;
    }

    add_parent(model){//метод добавления родителя
        let obj = model.selected_element;
        if (obj != null){
            if (obj.constructor.name == 'Centerline'){
                //console.log("Добавляем осевую");
                this.parents['Centerline'] = obj;
            }else if(obj.constructor.name == 'Point' && this.parents['Centerline'] != null){
                if(this.parents['Start_point'] == null && this.parents['Centerline'].point_on_line(obj)){
                    //console.log("Добавляем начальную точку");
                    this.parents['Start_point'] = obj;
                }else if(this.parents['End_point'] == null && this.parents['Centerline'].point_on_line(obj)){
                    //console.log("Добавляем конечную точку");
                    this.parents['End_point'] = obj;
                }
            }
        }else if(this.parents['Start_point'] != null && this.parents['End_point'] != null){//создание вспомогательной точки
            this.parents['Point'] = new Point();
            this.parents['Point'].set_coordinates(model.get_mouse_position());
        }
    }

    isFull(){//проверка определен ли элемента
        if(this.parents['Start_point'] == null || this.parents['End_point'] == null || this.parents['Point'] == null || this.parents['Centerline'] == null){
            return false;
        }
        return (this.parents['Start_point'].isFull() && this.parents['End_point'].isFull() && this.parents['Point'].isFull() && this.parents['Centerline'].isFull());
    }

    set_draw_points(model){//метод уставки точек для рисования
        let x;
        let y;
        let alfa;
        if (this.parents['End_point'] == null){
            x = model.get_mouse_position()[0];
            y = model.get_mouse_position()[1];
            alfa = Math.atan((y - this.parents['Start_point'].y) / (x - this.parents['Start_point'].x));
            this.draw_points[0].set_coordinates([this.parents['Start_point'].x + this.height * Math.sin(alfa), this.parents['Start_point'].y - this.height * Math.cos(alfa)]);
            this.draw_points[1].set_coordinates([x + this.height * Math.sin(alfa), y - this.height * Math.cos(alfa)]);
            this.draw_points[2].set_coordinates([x, y])
        }else if(this.parents['End_point'] != null && this.parents['Point'] == null){
            this.draw_points[2] = this.parents['End_point'];
            alfa = this.parents['Centerline'].get_inclination()
            //alfa = Math.atan((this.parents['End_point'].y - this.parents['Start_point'].y) / (this.parents['End_point'].x - this.parents['Start_point'].x));
            let betta = Math.atan((this.parents['End_point'].y - model.get_mouse_position()[1]) / (this.parents['End_point'].x - model.get_mouse_position()[0]));
            let b = get_distance(this.parents['End_point'].x, this.parents['End_point'].y , model.get_mouse_position()[0], model.get_mouse_position()[1]);
            this.height = b * Math.sin(betta - alfa);
            this.draw_points[0].set_coordinates([this.parents['Start_point'].x + this.height * Math.sin(alfa), this.parents['Start_point'].y - this.height * Math.cos(alfa)]);
            this.draw_points[1].set_coordinates([this.draw_points[2].x + this.height * Math.sin(alfa), this.draw_points[2].y - this.height * Math.cos(alfa)]);
        }else if(this.isFull()){
            this.parents['Point'].radius = 0;
        }
    }

    draw(model){//рисование
        if (this.parents['Start_point'] != null){
            this.set_draw_points(model);
            line_draw(this.parents['Start_point'], this.draw_points[0], model.context);
            vector_draw(this.draw_points[0], this.draw_points[1], model.context);
            vector_draw(this.draw_points[1], this.draw_points[0], model.context);
            line_draw(this.draw_points[1], this.draw_points[2], model.context);
            model.context.fillText(get_distance(this.parents['Start_point'].x, this.parents['Start_point'].y, this.draw_points[2].x, this.draw_points[2].y).toFixed(2), (this.draw_points[0].x + this.draw_points[1].x)/2, (this.draw_points[0].y + this.draw_points[1].y)/2);
        }
    }

    check_selection(x, y){
        return check_line(this.draw_points[0], this.draw_points[1], x, y);
    }
}

//класс Сила
class Force{
    constructor(){
        this.check = false;
        this.parents = {'Centerline': null, 'Start_point' : null, 'End_point': null};
        this.children = [];
        this.value = 0;

        COUNTER += 1;
        this.number = COUNTER;
        this.draw_points = [];
    }

    get_data(){
        let data = {};
        data["Centerline"] = this.parents['Centerline'].get_data();
        data["Start_point"] = this.parents['Start_point'].get_data();
        data["End_point"] = this.parents['End_point'].get_data();
        return data;
    }

    add_parent(model){//метод добавления родителя
        let obj = model.selected_element;
        if(obj != null){
            console.log("Объект не нуливой");
            if(obj.constructor.name == 'Centerline'){
                console.log("Объект осевая");
                if(this.parents['Centerline'] == null){
                    console.log("Определяем осевую")
                    this.parents['Centerline'] = obj;
                    console.log("Осевая: " + this.parents['Centerline']);
                }else{
                    console.log("Второе нажатие на осевую");
                    this.parents['Start_point'] = new Point();//если выбраный элемент осевая и мы шелкнули по ней второй раз, значит на ней нужно создать новую точку
                    let y = linear_equation(this.parents['Centerline'].parents['Start_point'], this.parents['Centerline'].parents['End_point'], model.get_mouse_position()[0]);
                    this.parents['Start_point'].set_coordinates([model.get_mouse_position()[0], y]);
                    this.parents['End_point'] = new Point();
                }
            }else if(obj.constructor.name == 'Point'){
                this.parents['Start_point'] = obj;
                this.parents['End_point'] = new Point();
            }
        }else{//если пришло null
            console.log("Объект нуливой");
            if(this.parents['Centerline'] != null && this.parents['Start_point'] != null){
                this.value = Number(prompt("Введете величину силы: "));
                console.log(this.value);
            }
        }
    }

    isFull(){//проверка определен ли элемента
        if(this.parents['Start_point'] == null || this.parents['End_point'] == null || this.value == 0){
            return false;
        }
        return (this.parents['Start_point'].isFull() && this.parents['End_point'].isFull() && this.value != 0);
    }

    set_draw_points(model){//метод уставки точек для рисования
        if(!this.isFull()){
            let x = model.get_mouse_position()[0];
            let y = model.get_mouse_position()[1];
            if(model.rectangular_drawing){
                this.parents['End_point'].set_coordinates([x, this.parents['Start_point'].y]);
            }else{
                this.parents['End_point'].set_coordinates([x, y]);
            }
        }
    }

    draw(model){//рисование
        if (this.parents['Start_point'] != null){
            this.set_draw_points(model);
            vector_draw(this.parents['Start_point'], this.parents['End_point'], model.context);
            model.context.fillText(this.value, (this.parents['Start_point'].x + this.parents['End_point'].x)/2, (this.parents['Start_point'].y + this.parents['End_point'].y)/2);
        }
    }

    check_selection(x, y){
        return check_line(this.parents['Start_point'], this.parents['End_point'], x, y);
    }
}