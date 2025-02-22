import React, { useState, useEffect } from "react";
import Title from './components/title/Title'
import Label from './components/label/Label'
// import Input from '../login/components/input/Input'
import Dropdown from './components/dropdown/Dropdown'
import { callLogin, getHotels } from '../../shared/Services/RequestService'
import '../login/login.scss'
import { useHistory } from 'react-router-dom'
import Background from '../../assets/img/loginImage.jpg'
import { showAlertNotification } from '../../shared/AlertNotification/AlertNotification'

const Login = () => {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [hotels, setHotels] = useState([]);
    const [showModal,setShowModal] = useState(false)
    const history = useHistory()

    let idHotel = 0;

    const buttonLogin = async () => {
        console.log("data: " + email + ", " + password + ", " + idHotel)
        const response = await callLogin(email, password, idHotel);
        if (response) {
            history.push("/home")
        } else {
            //Revisar el mensaje de error devuelto para cambiarlo por el hardcodeado
            showAlertNotification('', "Usuario y/o contraseña incorrecta.", 'danger')
        }
    };

    const searchHotels = async () => {
        const responseHotels = await getHotels();
        setHotels(responseHotels)
    }

    useEffect(() => {
        searchHotels();
    }, [])

    return (
        <div style={{
            width: "100vw",
            height: "100vh",
            backgroundImage: `url(${Background})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            textAlign: "center",
            fontSize: "30px",
            // marginLeft:"18%",
            color: "black"
        }} >
            <Title className="title-container" />
            <Label text="Email" />
            <input style={{
                padding: "1%",
                marginBottom: "2%",
                marginTop: "5%"
            }}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Ingrese su usuario'
            />
            <Label text="Contraseña" />
            <div style={{ padding: "2%" }}>
                <input style={{
                    padding: "1%",
                    marginBottom: "5vh",
                    marginTop: "2%"
                }}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Ingrese su contraseña'
                    type="password"
                />
            </div>

            {/* <Label text="Seleccione su hotel"/> */}
            <Dropdown />
        
            <button onClick={buttonLogin} style={{
                color: "#f5f5dc",
                backgroundColor: "grey",
                border: "2px solid  #50564f",
                marginTop: "5vh",
                fontWeight: "bolder",
                width: "10%",
                height: "8%",
                fontSize: "70%"
            }}
            >Ingresar</button>
        </div>
    )
};

export default Login;