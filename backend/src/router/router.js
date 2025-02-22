import express from 'express'
import ServicioHoteles from '../servicios/servicioHoteles.js'
import ParseService from '../shared/parser/parseService.js'
import EmailService from '../shared/mails/emailService.js'


class Router {

    constructor(){
        this.servHoteles = new ServicioHoteles()
        this.parseService = new ParseService()   
        this.emailService = new EmailService()     
    }

    createRouter(){
        const router = express.Router()
        
        // PUNTAS HOTEL 

        // Agrega un hotel sin reservas ni empleados
        // Recibe nombre, coordenadas y template del hotel y lo agrega a la base de hoteles.
        router.post('/hotel/crear', async(req, res, next) => {
            try {
                await this.servHoteles.agregar(req.body)
                res.status(201).send({msg: "Hotel creado exitosamente"})
            } catch(error) {
                next(error)
            }
        }); 

        // Devuelve todos los hoteles
        router.get('/hoteles', async(req, res, next) => {
            try {
                const hoteles = await this.servHoteles.buscarTodos()
                if(hoteles.length > 0){
                    res.status(200).json(hoteles)
                }else{
                    res.status(404).send({msg: "No hay hoteles para mostrar"})
                }                
            } catch(error) {
                next(error)
            }
        })

        // Devuelve un hotel por id
        // Recibe el id del hotel por parametro
        router.get('/:idHotel', async(req, res, next) => {
            try {
                const hotel = await this.servHoteles.buscarPorId(req.params.idHotel)
                if(hotel){
                    res.status(200).json(hotel)
                }else{
                    res.status(404).send({msg: "Hotel no encontrado"})
                }                
            } catch(error) {
                next(error)
            }
        })

        // Devuelve todos los hoteles
        router.get('/hoteles/lista', async(req, res, next) => {
            try {
                const hoteles = await this.servHoteles.listar()
                if(hoteles.length > 0){
                    res.status(200).json(hoteles)
                }else{
                    res.status(404).send({msg: "No hay hoteles para mostrar"})
                }                
            } catch(error) {
                next(error)
            }
        })

        // Borra un hotel, se pierden reservas con sus huespedes y empleados
        // Recibe el id del hotel por parametro
        router.delete('/:idHotel/borrar',async (req, res, next) =>{
            try {
                await this.servHoteles.borrar(req.params.idHotel); 
                res.status(200).send({msg: "Hotel borrado exitosamente"})                
            } catch(error) {
                next(error)
            }         
        })


        // PUNTAS RESERVA

        // Agrega una reserva a un hotel. 
        // Recibe el id del hotel por parametro, inicio y fin de la reserva y nombre, apellido y mail del huesped por el body.         
        router.post('/:idHotel/reserva/crear', async(req, res, next) => {
            try {
                await this.servHoteles.agregarReserva(req.params.idHotel,req.body)
                res.status(201).send({msg: "Reserva agregada exitosamente"})
            } catch(error) {
                next(error)
            }
        });

        // Recibe un codigo de reserva y de hotel y devuelve la reserva encontrada o 404 not found
        router.get('/:idHotel/:codReserva', async(req, res, next) => {
            try {
                const reserva = await this.servHoteles.buscarReserva(req.params.idHotel, req.params.codReserva)
                if(reserva !== null){
                    res.status(200).json(reserva)
                }else{
                    res.status(404).send({msg: "Reserva no encontrada"})
                }                
            } catch(error) {
                next(error)
            }
        })

        // Actualiza la reserva
        // Tiene que recibir un multipart/form-data con la foto, tipo y numero de documento
        router.put('/:idHotel/:codReserva/actualizar/foto', async(req, res, next) => {
            try {
                var datos = await this.parseService.parseForm(req)
                await this.servHoteles.actualizarReserva(req.params.idHotel, req.params.codReserva, null, datos.foto, datos.tipo, datos.documento, null)
                res.status(201).send({msg: "Reserva actualizada"})
            } catch(error) {
                next(error)
            }
        });        

        // Actualiza la reserva
        // Recibe el codigo de reserva y el numero de habitacion por parametro y actualiza la reserva 
        router.put('/:idHotel/:codReserva/actualizar/:numHabitacion',async (req, res, next) =>{
            try {
                await this.servHoteles.actualizarReserva(req.params.idHotel, req.params.codReserva, null, null, null, null, req.params.numHabitacion)
                res.status(201).send({msg: "Reserva actualizada"})
            } catch(error) {
                next(error)
            }         
        })


        // PUNTAS EMPLEADO        

        // Agrega un empleado a un hotel. 
        // Recibe el id del hotel por parametro y nombre, apellido, email y password de un empleado por body.         
        router.post('/:idHotel/empleado/crear', async(req, res, next) => {
            try {
                await this.servHoteles.agregarEmpleado(req.params.idHotel, req.body)
                res.status(201).send({msg: "Empleado agregado exitosamente"})
            } catch(error) {
                next(error)
            }
        });    

        // Login empleado a un hotel. 
        // Recibe por body email y contraseña         
        router.post('/:idHotel/empleado/login', async(req, res, next) => {
            try {
                var ok = await this.servHoteles.loginEmpleado(req.params.idHotel, req.body.email, req.body.password)
                if(ok){
                    res.status(200).send({msg: "Bienvenido!"})
                }else{
                    res.status(403).send({msg: "Error de login"})
                }  
            } catch(error) {
                next(error)
            }
        }); 


        // PUNTAS HUESPED

        // Validacion del huesped. 
        // Recibe hotel y codigo de reserva por parametro, y por body email  
        router.post('/:idHotel/:codReserva/validar', async (req, res, next) => {
            try {
                var ok = await this.servHoteles.validarHuesped(req.params.idHotel, req.params.codReserva, req.body.email)
                if(ok){
                    res.status(200).send({msg: "Bienvenido!"})
                }else{
                    res.status(403).send({msg: "Datos de reserva invalidos"})
                }  
            } catch(error) {
                next(error)
            }         
        });

        // Borrar datos huesped. 
        // Recibe hotel y codigo de reserva por parametro  
        router.delete('/:idHotel/:codReserva/huesped/borrar', async (req, res, next) => {
            try {
                var ok = await this.servHoteles.borrarHuesped(req.params.idHotel, req.params.codReserva)
                if(ok){
                    res.status(200).send({msg: "Datos del huesped eliminados"})
                }else{
                    res.status(404).send({msg: "Reserva no encontrada"})
                }  
            } catch(error) {
                next(error)
            }         
        });


        // PUNTAS EXTRA
        
        // Envio email de info hotel
        // Recibe el id del hotel por parametro para buscar el template y el mail del huesped por el body.
        router.post('/:idHotel/email/enviar', async (req, res, next) => {
            try {
                var hotel = this.servHoteles.buscarPorId(req.params.idHotel)
                this.emailService.sendInfo(req.body.email, hotel.template)
                res.status(200).send({msg: "Enviado"})
            } catch(error) {
                next(error)
            }
        });        

        return router
    }
}

export default Router
