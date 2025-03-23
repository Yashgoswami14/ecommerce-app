import React,{useState} from 'react';
import {motion} from "framer-motion";
import {Link} from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";


const LoginPage = () => {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  

  const handleSubmit = (e) => {
		e.preventDefault();
		console.log(email, password);
		login(email, password);
	};
  return (
    <div>
      <h1>Login page</h1>
    </div>
  )
}

export default LoginPage
