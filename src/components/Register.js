import api from "../utils/axiosConfig";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../css/login.css";
import img from "../STC_logo-01.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const history = useNavigate();

  const handleRoleChange = (selectedRoles) => {
    setRoles(selectedRoles.map((role) => role.value));
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(`${API_URL}/auth/signup`, {
        userName,
        email,
        password,
        roles,
        location: selectedState,
      });
      alert("Sign Up successful!");
      window.location.reload();
    } catch (error) {
      console.error("Sign Up failed:", error.response.data.message);
    }
  };

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "mod", label: "Moderator" },
    { value: "user", label: "User" },
    { value: "state", label: "State" },
    { value: "Eastern Vidarbha", label: "Eastern Vidarbha" },
    { value: "Konkan", label: "Konkan" },
    { value: "Marathwada", label: "Marathwada" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Northern Maharashtra", label: "Northern Maharashtra" },
    { value: "Thane + Palghar", label: "Thane + Palghar" },
    { value: "Western Vidarbha", label: "Western Vidarbha" },
    { value: "Western Maharashtra", label: "Western Maharashtra" },
    { value: "1-Nandurbar (ST)", label: "1-Nandurbar (ST)" },
    { value: "10-Nagpur", label: "10-Nagpur" },
    { value: "11-Bhandara-Gondiya", label: "11-Bhandara-Gondiya" },
    { value: "12-Gadchiroli-Chimur (ST)", label: "12-Gadchiroli-Chimur (ST)" },
    { value: "13-Chandrapur", label: "13-Chandrapur" },
    { value: "14-Yavatmal-Washim", label: "14-Yavatmal-Washim" },
    { value: "15-Hingoli", label: "15-Hingoli" },
    { value: "16-Nanded", label: "16-Nanded" },
    { value: "17-Parbhani", label: "17-Parbhani" },
    { value: "18-Jalna", label: "18-Jalna" },
    {
      value: "19-Chatrapati Sambhaji Nagar",
      label: "19-Chatrapati Sambhaji Nagar",
    },
    { value: "2-Dhule", label: "2-Dhule" },
    { value: "20-Dindori (ST)", label: "20-Dindori (ST)" },
    { value: "21-Nashik", label: "21-Nashik" },
    { value: "22-Palghar (ST)", label: "22-Palghar (ST)" },
    { value: "23-Bhiwandi", label: "23-Bhiwandi" },
    { value: "24-Kalyan", label: "24-Kalyan" },
    { value: "25-Thane", label: "25-Thane" },
    { value: "26-Mumbai North", label: "26-Mumbai North" },
    { value: "27-Mumbai North-West", label: "27-Mumbai North-West" },
    { value: "28-Mumbai North-East", label: "28-Mumbai North-East" },
    { value: "29-Mumbai North-Central", label: "29-Mumbai North-Central" },
    { value: "3-Jalgaon", label: "3-Jalgaon" },
    { value: "30-Mumbai South-Central", label: "30-Mumbai South-Central" },
    { value: "31-Mumbai South", label: "31-Mumbai South" },
    { value: "32-Raigad", label: "32-Raigad" },
    { value: "33-Maval", label: "33-Maval" },
    { value: "34-Pune", label: "34-Pune" },
    { value: "35-Baramati", label: "35-Baramati" },
    { value: "36-Shirur", label: "36-Shirur" },
    { value: "37-Ahmednagar", label: "37-Ahmednagar" },
    { value: "38-Shirdi (SC)", label: "38-Shirdi (SC)" },
    { value: "39-Beed", label: "39-Beed" },
    { value: "4-Raver", label: "4-Raver" },
    { value: "40-Dharashiv", label: "40-Dharashiv" },
    { value: "41-Latur (SC)", label: "41-Latur (SC)" },
    { value: "42-Solapur (SC)", label: "42-Solapur (SC)" },
    { value: "43-Madha", label: "43-Madha" },
    { value: "44-Sangli", label: "44-Sangli" },
    { value: "45-Satara", label: "45-Satara" },
    { value: "46-Ratnagiri-Sindhudurg", label: "46-Ratnagiri-Sindhudurg" },
    { value: "47-Kolhapur", label: "47-Kolhapur" },
    { value: "48-Hatkanangle", label: "48-Hatkanangle" },
    { value: "5-Buldhana", label: "5-Buldhana" },
    { value: "6-Akola", label: "6-Akola" },
    { value: "7-Amravati (SC)", label: "7-Amravati (SC)" },
    { value: "8-Wardha", label: "8-Wardha" },
    { value: "9-Ramtek (SC)", label: "9-Ramtek (SC)" },
    { value: "Ahmednagar", label: "Ahmednagar" },
    { value: "Akola", label: "Akola" },
    { value: "Washim", label: "Washim" },
    { value: "Amravati", label: "Amravati" },
    {
      value: "Chhatrapati Sambhaji Nagar",
      label: "Chhatrapati Sambhaji Nagar",
    },
    { value: "Pune", label: "Pune" },
    { value: "Beed", label: "Beed" },
    { value: "Bhandara", label: "Bhandara" },
    { value: "Gondiya", label: "Gondiya" },
    { value: "Thane", label: "Thane" },
    { value: "Buldhana", label: "Buldhana" },
    { value: "Chandrapur", label: "Chandrapur" },
    { value: "Yavatmal", label: "Yavatmal" },
    { value: "Dhule", label: "Dhule" },
    { value: "Nashik", label: "Nashik" },
    { value: "Gadchiroli", label: "Gadchiroli" },
    { value: "Kolhapur", label: "Kolhapur" },
    { value: "Sangli", label: "Sangli" },
    { value: "Nanded", label: "Nanded" },
    { value: "Hingoli", label: "Hingoli" },
    { value: "Jalgaon", label: "Jalgaon" },
    { value: "Jalna", label: "Jalna" },
    { value: "Latur", label: "Latur" },
    { value: "Solapur", label: "Solapur" },
    { value: "Satara", label: "Satara" },
    { value: "Raigad", label: "Raigad" },
    { value: "Mumbai (Suburban)", label: "Mumbai (Suburban)" },
    { value: "Mumbai City", label: "Mumbai City" },
    { value: "Nagpur", label: "Nagpur" },
    { value: "Nandurbar", label: "Nandurbar" },
    { value: "Dharashiv", label: "Dharashiv" },
    { value: "Palghar", label: "Palghar" },
    { value: "Parbhani", label: "Parbhani" },
    { value: "Ratnagiri", label: "Ratnagiri" },
    { value: "Sindhudurg", label: "Sindhudurg" },
    { value: "Wardha", label: "Wardha" },
    { value: "1-Akkalkuwa(ST)", label: "1-Akkalkuwa(ST)" },
    { value: "2-Shahada(ST)", label: "2-Shahada(ST)" },
    { value: "3-Nandurbar(ST)", label: "3-Nandurbar(ST)" },
    { value: "4-Nawapur(ST)", label: "4-Nawapur(ST)" },
    { value: "5-Sakri(ST)", label: "5-Sakri(ST)" },
    { value: "6-Dhule Rural", label: "6-Dhule Rural" },
    { value: "7-Dhule City", label: "7-Dhule City" },
    { value: "8-Sindhkheda", label: "8-Sindhkheda" },
    { value: "9-Shirpur(ST)", label: "9-Shirpur(ST)" },
    { value: "10-Chopda(ST)", label: "10-Chopda(ST)" },
    { value: "11-Raver", label: "11-Raver" },
    { value: "12-Bhusawal(SC)", label: "12-Bhusawal(SC)" },
    { value: "13-Jalgaon City", label: "13-Jalgaon City" },
    { value: "14-Jalgaon Rural", label: "14-Jalgaon Rural" },
    { value: "15-Amalner", label: "15-Amalner" },
    { value: "16-Erandol", label: "16-Erandol" },
    { value: "17-Chalisgaon", label: "17-Chalisgaon" },
    { value: "18-Pachora", label: "18-Pachora" },
    { value: "19-Jamner", label: "19-Jamner" },
    { value: "20-Muktainagar", label: "20-Muktainagar" },
    { value: "21-Malkapur", label: "21-Malkapur" },
    { value: "22-Buldhana", label: "22-Buldhana" },
    { value: "23-Chikhli", label: "23-Chikhli" },
    { value: "24-Sindhkhed Raja", label: "24-Sindhkhed Raja" },
    { value: "25-Mehkar(SC)", label: "25-Mehkar(SC)" },
    { value: "26-Khamgaon", label: "26-Khamgaon" },
    { value: "27-Jalgaon(Jamod)", label: "27-Jalgaon(Jamod)" },
    { value: "28-Akot", label: "28-Akot" },
    { value: "29-Balapur", label: "29-Balapur" },
    { value: "30-Aakola West", label: "30-Aakola West" },
    { value: "31-Akola East", label: "31-Akola East" },
    { value: "32-Murtizapur(SC)", label: "32-Murtizapur(SC)" },
    { value: "33-Risod", label: "33-Risod" },
    { value: "34-Washim(SC)", label: "34-Washim(SC)" },
    { value: "35-Karanja", label: "35-Karanja" },
    { value: "36-Dhamangaon Railway", label: "36-Dhamangaon Railway" },
    { value: "37-Badnera", label: "37-Badnera" },
    { value: "38-Amrawati", label: "38-Amrawati" },
    { value: "39-Teosa", label: "39-Teosa" },
    { value: "40-Daryapur(SC)", label: "40-Daryapur(SC)" },
    { value: "41-Melghat(ST)", label: "41-Melghat(ST)" },
    { value: "42-Achalpur", label: "42-Achalpur" },
    { value: "43-Morshi", label: "43-Morshi" },
    { value: "44-Arvi", label: "44-Arvi" },
    { value: "45-Deoli", label: "45-Deoli" },
    { value: "46-Hinganghat", label: "46-Hinganghat" },
    { value: "47-Wardha", label: "47-Wardha" },
    { value: "48-Katol", label: "48-Katol" },
    { value: "49-Savner", label: "49-Savner" },
    { value: "50-Hingna", label: "50-Hingna" },
    { value: "51-Umred(SC)", label: "51-Umred(SC)" },
    { value: "52-Nagpur South West", label: "52-Nagpur South West" },
    { value: "53-Nagpur South", label: "53-Nagpur South" },
    { value: "54-Nagpur East", label: "54-Nagpur East" },
    { value: "55-Nagpur Central", label: "55-Nagpur Central" },
    { value: "56-Nagpur West", label: "56-Nagpur West" },
    { value: "57-Nagpur North(SC)", label: "57-Nagpur North(SC)" },
    { value: "58-Kamthi", label: "58-Kamthi" },
    { value: "59-Ramtek", label: "59-Ramtek" },
    { value: "60-Tumsar", label: "60-Tumsar" },
    { value: "61-Bhandara(SC)", label: "61-Bhandara(SC)" },
    { value: "62-Sakoli", label: "62-Sakoli" },
    { value: "63-Arjuni Morgaon(SC)", label: "63-Arjuni Morgaon(SC)" },
    { value: "64-Tirora", label: "64-Tirora" },
    { value: "65-Gondia", label: "65-Gondia" },
    { value: "66-Amgaon(ST)", label: "66-Amgaon(ST)" },
    { value: "67-Armori(ST)", label: "67-Armori(ST)" },
    { value: "68-Gadchiroli(ST)", label: "68-Gadchiroli(ST)" },
    { value: "69-Aheri(ST)", label: "69-Aheri(ST)" },
    { value: "70-Rajura", label: "70-Rajura" },
    { value: "71-Chandrapur(SC)", label: "71-Chandrapur(SC)" },
    { value: "72-Ballarpur", label: "72-Ballarpur" },
    { value: "73-Bramhapuri", label: "73-Bramhapuri" },
    { value: "74-Chimur", label: "74-Chimur" },
    { value: "75-Warora", label: "75-Warora" },
    { value: "76-Wani", label: "76-Wani" },
    { value: "77-Ralegaon(ST)", label: "77-Ralegaon(ST)" },
    { value: "78-Yavatmal", label: "78-Yavatmal" },
    { value: "79-Digras", label: "79-Digras" },
    { value: "80-Arni(ST)", label: "80-Arni(ST)" },
    { value: "81-Pusad", label: "81-Pusad" },
    { value: "82-Umarkhed(SC)", label: "82-Umarkhed(SC)" },
    { value: "83-Kinwat", label: "83-Kinwat" },
    { value: "84-Hidgaon", label: "84-Hidgaon" },
    { value: "85-Bhokar", label: "85-Bhokar" },
    { value: "86-Nanded North", label: "86-Nanded North" },
    { value: "87-Nanded south", label: "87-Nanded south" },
    { value: "88-Loha", label: "88-Loha" },
    { value: "89-Naigaon", label: "89-Naigaon" },
    { value: "90-Deglur(sc)", label: "90-Deglur(sc)" },
    { value: "91-Mukhed", label: "91-Mukhed" },
    { value: "92-Basmath", label: "92-Basmath" },
    { value: "93-Kalamnuri", label: "93-Kalamnuri" },
    { value: "94-Hingoli", label: "94-Hingoli" },
    { value: "95-Jintur", label: "95-Jintur" },
    { value: "96-Parbhani", label: "96-Parbhani" },
    { value: "97-Gangakhed", label: "97-Gangakhed" },
    { value: "98-Pathri", label: "98-Pathri" },
    { value: "99-Partur", label: "99-Partur" },
    { value: "100-Gansavangi", label: "100-Gansavangi" },
    { value: "101-Jalna", label: "101-Jalna" },
    { value: "102-Badnapur(SC)", label: "102-Badnapur(SC)" },
    { value: "103-Bhokardan", label: "103-Bhokardan" },
    { value: "104-Sillod", label: "104-Sillod" },
    { value: "105-Kannad", label: "105-Kannad" },
    { value: "106-Pholambari", label: "106-Pholambari" },
    {
      value: "107-Chatrapati Sambhaji Nagar(Central)",
      label: "107-Chatrapati Sambhaji Nagar(Central)",
    },
    {
      value: "108-Chatrapati Sambhaji Nagar(West)(SC)",
      label: "108-Chatrapati Sambhaji Nagar(West)(SC)",
    },
    { value: "109-Aurangbad(East)", label: "109-Aurangbad(East)" },
    { value: "110-Paithan", label: "110-Paithan" },
    { value: "111-Gangapur", label: "111-Gangapur" },
    { value: "112-Vaijapur", label: "112-Vaijapur" },
    { value: "113-Nandgaon", label: "113-Nandgaon" },
    { value: "114-Malegaon(Central)", label: "114-Malegaon(Central)" },
    { value: "115-Malegaon(Outer)", label: "115-Malegaon(Outer)" },
    { value: "116-Baglan(ST)", label: "116-Baglan(ST)" },
    { value: "117-Kalwan(ST)", label: "117-Kalwan(ST)" },
    { value: "118-Chandwad", label: "118-Chandwad" },
    { value: "119-Yevla", label: "119-Yevla" },
    { value: "120-Sinnar", label: "120-Sinnar" },
    { value: "121-Niphad", label: "121-Niphad" },
    { value: "122-Dindori(ST)", label: "122-Dindori(ST)" },
    { value: "123-Nashik East", label: "123-Nashik East" },
    { value: "124-Nashik(Central)", label: "124-Nashik(Central)" },
    { value: "125-Nashik West", label: "125-Nashik West" },
    { value: "126-Deolali(SC)", label: "126-Deolali(SC)" },
    { value: "127-Igatpuri(ST)", label: "127-Igatpuri(ST)" },
    { value: "128-Dahanu(ST)", label: "128-Dahanu(ST)" },
    { value: "129-Vekramgrth(ST)", label: "129-Vekramgrth(ST)" },
    { value: "130-Palghar(ST)", label: "130-Palghar(ST)" },
    { value: "131-Boisar(ST)", label: "131-Boisar(ST)" },
    { value: "132-Nalasopara", label: "132-Nalasopara" },
    { value: "133-Vasai", label: "133-Vasai" },
    { value: "134-Bhiwandi Rural(ST)", label: "134-Bhiwandi Rural(ST)" },
    { value: "135-Shahapur(ST)", label: "135-Shahapur(ST)" },
    { value: "136-Bhiwandi West", label: "136-Bhiwandi West" },
    { value: "137-Bhiwandi East", label: "137-Bhiwandi East" },
    { value: "138-Kalyan West", label: "138-Kalyan West" },
    { value: "139-Murbad", label: "139-Murbad" },
    { value: "140-Ambarnath(SC)", label: "140-Ambarnath(SC)" },
    { value: "141-Ulhasnagar", label: "141-Ulhasnagar" },
    { value: "142-Kalyan East", label: "142-Kalyan East" },
    { value: "143-Dombivali", label: "143-Dombivali" },
    { value: "144-Kalyan Rural", label: "144-Kalyan Rural" },
    { value: "145-Meera Bhayandar", label: "145-Meera Bhayandar" },
    { value: "146-ovala majiwada", label: "146-ovala majiwada" },
    { value: "147-Kopri-Pachpakhadi", label: "147-Kopri-Pachpakhadi" },
    { value: "148-Thane", label: "148-Thane" },
    { value: "149-Mumbra-Kalwa", label: "149-Mumbra-Kalwa" },
    { value: "150-Airoli", label: "150-Airoli" },
    { value: "151-Belapur", label: "151-Belapur" },
    { value: "152-Borivali", label: "152-Borivali" },
    { value: "153-Dhaisar", label: "153-Dhaisar" },
    { value: "154-Magathane", label: "154-Magathane" },
    { value: "155-Mulund", label: "155-Mulund" },
    { value: "156-Vikhroli", label: "156-Vikhroli" },
    { value: "157-Bhandup West", label: "157-Bhandup West" },
    { value: "158-Jogeshwari East", label: "158-Jogeshwari East" },
    { value: "159-Dindoshi", label: "159-Dindoshi" },
    { value: "160-Kandivali East", label: "160-Kandivali East" },
    { value: "161-Charkop", label: "161-Charkop" },
    { value: "162-Malad West", label: "162-Malad West" },
    { value: "163-Goregaon", label: "163-Goregaon" },
    { value: "164-Varsova", label: "164-Varsova" },
    { value: "165-Andheri West", label: "165-Andheri West" },
    { value: "166-Andheri East", label: "166-Andheri East" },
    { value: "167-Vile Parle", label: "167-Vile Parle" },
    { value: "168-Chandivali", label: "168-Chandivali" },
    { value: "169-Ghatkopar West", label: "169-Ghatkopar West" },
    { value: "170-Ghatkopar East", label: "170-Ghatkopar East" },
    { value: "171-Mankhurd Shivajinagar", label: "171-Mankhurd Shivajinagar" },
    { value: "172-Anushakti Nagar", label: "172-Anushakti Nagar" },
    { value: "173-Chembur", label: "173-Chembur" },
    { value: "174-Kurla (sc)", label: "174-Kurla (sc)" },
    { value: "175-Kalina", label: "175-Kalina" },
    { value: "176-Vandre East", label: "176-Vandre East" },
    { value: "177-Vandre West", label: "177-Vandre West" },
    { value: "178-Dharavi", label: "178-Dharavi" },
    { value: "179-Sion Koliwada", label: "179-Sion Koliwada" },
    { value: "180-Wadala", label: "180-Wadala" },
    { value: "181-Mahim", label: "181-Mahim" },
    { value: "182-Worli", label: "182-Worli" },
    { value: "183-Shivadi", label: "183-Shivadi" },
    { value: "184-Byculla", label: "184-Byculla" },
    { value: "185-Malabar Hill", label: "185-Malabar Hill" },
    { value: "186-Mumbadevi", label: "186-Mumbadevi" },
    { value: "187-Colaba", label: "187-Colaba" },
    { value: "188-Panvel", label: "188-Panvel" },
    { value: "189-Karjat", label: "189-Karjat" },
    { value: "190-Uran", label: "190-Uran" },
    { value: "191-Pen", label: "191-Pen" },
    { value: "192-alibag", label: "192-alibag" },
    { value: "193-Shrivardhan", label: "193-Shrivardhan" },
    { value: "194-mahad", label: "194-mahad" },
    { value: "195-Junnar", label: "195-Junnar" },
    { value: "196-Ambegaon", label: "196-Ambegaon" },
    { value: "197-Khed Alandi", label: "197-Khed Alandi" },
    { value: "198-Shirur", label: "198-Shirur" },
    { value: "199-Daund", label: "199-Daund" },
    { value: "200-Indapur", label: "200-Indapur" },
    { value: "201-Baramati", label: "201-Baramati" },
    { value: "202-Purandar", label: "202-Purandar" },
    { value: "203-Bhor", label: "203-Bhor" },
    { value: "204-Maval", label: "204-Maval" },
    { value: "205-Chinchwad", label: "205-Chinchwad" },
    { value: "206-Pimpri(SC)", label: "206-Pimpri(SC)" },
    { value: "207-Bhosari", label: "207-Bhosari" },
    { value: "208-Vadgaon Sheri", label: "208-Vadgaon Sheri" },
    { value: "209-Shivajinagar", label: "209-Shivajinagar" },
    { value: "210-Kothrud", label: "210-Kothrud" },
    { value: "211-Khadakwasala", label: "211-Khadakwasala" },
    { value: "212-Parvati", label: "212-Parvati" },
    { value: "213-Hadapsar", label: "213-Hadapsar" },
    { value: "214-Pune Cantonment(SC)", label: "214-Pune Cantonment(SC)" },
    { value: "215-Kasba Peth", label: "215-Kasba Peth" },
    { value: "216-Akole(ST)", label: "216-Akole(ST)" },
    { value: "217-Sangmner", label: "217-Sangmner" },
    { value: "218-Shirdi", label: "218-Shirdi" },
    { value: "219-Kopargaon", label: "219-Kopargaon" },
    { value: "220-Shrirampur(SC)", label: "220-Shrirampur(SC)" },
    { value: "221-Nevasa", label: "221-Nevasa" },
    { value: "222-Shevgaon", label: "222-Shevgaon" },
    { value: "223-Rahuri", label: "223-Rahuri" },
    { value: "224-Parner", label: "224-Parner" },
    { value: "225-Ahmednagar City", label: "225-Ahmednagar City" },
    { value: "226-Shrigonda", label: "226-Shrigonda" },
    { value: "227-Karjat Jamkhed", label: "227-Karjat Jamkhed" },
    { value: "228-Georai", label: "228-Georai" },
    { value: "229-Majalgaon", label: "229-Majalgaon" },
    { value: "230-Beed", label: "230-Beed" },
    { value: "231-Ashti", label: "231-Ashti" },
    { value: "232-Kaij(SC)", label: "232-Kaij(SC)" },
    { value: "233-Parli", label: "233-Parli" },
    { value: "234-Latur Rural", label: "234-Latur Rural" },
    { value: "235-Latur City", label: "235-Latur City" },
    { value: "236-Ahmedpur", label: "236-Ahmedpur" },
    { value: "237-Udgir(SC)", label: "237-Udgir(SC)" },
    { value: "238-Nilanga", label: "238-Nilanga" },
    { value: "239-Ausa", label: "239-Ausa" },
    { value: "240-Omerga(SC)", label: "240-Omerga(SC)" },
    { value: "241-Tuljapur", label: "241-Tuljapur" },
    { value: "242-Dharashiv", label: "242-Dharashiv" },
    { value: "243-Paranda", label: "243-Paranda" },
    { value: "244-Karmala", label: "244-Karmala" },
    { value: "245-Madha", label: "245-Madha" },
    { value: "246-Barshi", label: "246-Barshi" },
    { value: "247-Mohol(SC)", label: "247-Mohol(SC)" },
    { value: "248-solapur north", label: "248-solapur north" },
    { value: "249-solapur central", label: "249-solapur central" },
    { value: "250-Akkalkot", label: "250-Akkalkot" },
    { value: "251-Solapur South", label: "251-Solapur South" },
    { value: "252-Pandharpur", label: "252-Pandharpur" },
    { value: "253-Sangola", label: "253-Sangola" },
    { value: "254-Malshiran(SC)", label: "254-Malshiran(SC)" },
    { value: "255-Phaltan(SC)", label: "255-Phaltan(SC)" },
    { value: "256-Wai", label: "256-Wai" },
    { value: "257-koregaon", label: "257-koregaon" },
    { value: "258-Man", label: "258-Man" },
    { value: "259-Karad North", label: "259-Karad North" },
    { value: "260-Karad South", label: "260-Karad South" },
    { value: "261-patan", label: "261-patan" },
    { value: "262-Satara", label: "262-Satara" },
    { value: "263-Dapoli", label: "263-Dapoli" },
    { value: "264-Guhagar", label: "264-Guhagar" },
    { value: "265-Chiplun", label: "265-Chiplun" },
    { value: "266-Ratnagiri", label: "266-Ratnagiri" },
    { value: "267-Rajapur", label: "267-Rajapur" },
    { value: "268-Kankavli", label: "268-Kankavli" },
    { value: "269-Kudal", label: "269-Kudal" },
    { value: "270-Sawantwadi", label: "270-Sawantwadi" },
    { value: "271-Chandgad", label: "271-Chandgad" },
    { value: "272-Radhanagari", label: "272-Radhanagari" },
    { value: "273-kagal", label: "273-kagal" },
    { value: "274-Kolhapur South", label: "274-Kolhapur South" },
    { value: "275-Karvir", label: "275-Karvir" },
    { value: "276-Kolhapur North", label: "276-Kolhapur North" },
    { value: "277-Shahuwadi", label: "277-Shahuwadi" },
    { value: "278-Hatkanangle(SC)", label: "278-Hatkanangle(SC)" },
    { value: "279-Ichalkaranji", label: "279-Ichalkaranji" },
    { value: "280-Shirol", label: "280-Shirol" },
    { value: "281-Miraj(SC)", label: "281-Miraj(SC)" },
    { value: "282-Sangli", label: "282-Sangli" },
    { value: "283-islampur", label: "283-islampur" },
    { value: "284-Shirala", label: "284-Shirala" },
    { value: "285-Palus-Kadegaon", label: "285-Palus-Kadegaon" },
    { value: "286-Khanpur", label: "286-Khanpur" },
    { value: "287-Tasgaon-Kavathe", label: "287-Tasgaon-Kavathe" },
    { value: "288-Jat", label: "288-Jat" },
    {
      value: "1-Mekliganj (SC)",
      label: "1-Mekliganj (SC)",
    },
    {
      value: "2-Mathabhanga (SC)",
      label: "2-Mathabhanga (SC)",
    },
    {
      value: "3-Cooch Behar Uttar (SC)",
      label: "3-Cooch Behar Uttar (SC)",
    },
    {
      value: "4-Cooch Behar Dakshin",
      label: "4-Cooch Behar Dakshin",
    },
    {
      value: "5-Sitalkuchi (SC)",
      label: "5-Sitalkuchi (SC)",
    },
    {
      value: "6-Sitai (SC)",
      label: "6-Sitai (SC)",
    },
    {
      value: "7-Dinhata",
      label: "7-Dinhata",
    },
    {
      value: "8-Natabari",
      label: "8-Natabari",
    },
    {
      value: "9-Tufanganj",
      label: "9-Tufanganj",
    },
    {
      value: "10-Kumargram (ST)",
      label: "10-Kumargram (ST)",
    },
    {
      value: "11-Kalchini (ST)",
      label: "11-Kalchini (ST)",
    },
    {
      value: "12-Alipurudars",
      label: "12-Alipurudars",
    },
    {
      value: "13-Falakata (SC)",
      label: "13-Falakata (SC)",
    },
    {
      value: "14-Madarihat (ST)",
      label: "14-Madarihat (ST)",
    },
    {
      value: "15-Dhupguri (SC)",
      label: "15-Dhupguri (SC)",
    },
    {
      value: "16-Maynaguri (SC)",
      label: "16-Maynaguri (SC)",
    },
    {
      value: "17-Jalpaiguri (SC)",
      label: "17-Jalpaiguri (SC)",
    },
    {
      value: "18-Rajganj (SC)",
      label: "18-Rajganj (SC)",
    },
    {
      value: "19-Dabgram-Phulbari",
      label: "19-Dabgram-Phulbari",
    },
    {
      value: "20-Mal (ST)",
      label: "20-Mal (ST)",
    },
    {
      value: "21-Nagrakata (ST)",
      label: "21-Nagrakata (ST)",
    },
    {
      value: "22-Kalimpong",
      label: "22-Kalimpong",
    },
    {
      value: "23-Darjeeling",
      label: "23-Darjeeling",
    },
    {
      value: "24-Kurseong",
      label: "24-Kurseong",
    },
    {
      value: "25-Matigara-Naxalbari (SC)",
      label: "25-Matigara-Naxalbari (SC)",
    },
    {
      value: "26-Siliguri",
      label: "26-Siliguri",
    },
    {
      value: "27-Phansidewa (ST)",
      label: "27-Phansidewa (ST)",
    },
    {
      value: "28-Chopra",
      label: "28-Chopra",
    },
    {
      value: "29-Islampur",
      label: "29-Islampur",
    },
    {
      value: "30-Goalpokhar",
      label: "30-Goalpokhar",
    },
    {
      value: "31-Chakulia",
      label: "31-Chakulia",
    },
    {
      value: "32-Karandighi",
      label: "32-Karandighi",
    },
    {
      value: "33-Hemtabad (SC)",
      label: "33-Hemtabad (SC)",
    },
    {
      value: "34-Kaliaganj (SC)",
      label: "34-Kaliaganj (SC)",
    },
    {
      value: "35-Raiganj",
      label: "35-Raiganj",
    },
    {
      value: "36-Itahar",
      label: "36-Itahar",
    },
    {
      value: "37-Kushmandi (SC)",
      label: "37-Kushmandi (SC)",
    },
    {
      value: "38-Kumarganj",
      label: "38-Kumarganj",
    },
    {
      value: "39-Balurghat",
      label: "39-Balurghat",
    },
    {
      value: "40-Tapan (ST)",
      label: "40-Tapan (ST)",
    },
    {
      value: "41-Gangarampur (SC)",
      label: "41-Gangarampur (SC)",
    },
    {
      value: "42-Harirampur",
      label: "42-Harirampur",
    },
    {
      value: "43-Habibpur (ST)",
      label: "43-Habibpur (ST)",
    },
    {
      value: "44-Gazole (SC)",
      label: "44-Gazole (SC)",
    },
    {
      value: "45-Chanchal",
      label: "45-Chanchal",
    },
    {
      value: "46-Harishchandrapur",
      label: "46-Harishchandrapur",
    },
    {
      value: "47-Malatipur",
      label: "47-Malatipur",
    },
    {
      value: "48-Ratua",
      label: "48-Ratua",
    },
    {
      value: "49-Manikchak",
      label: "49-Manikchak",
    },
    {
      value: "50-Maldaha",
      label: "50-Maldaha",
    },
    {
      value: "51-English Bazar",
      label: "51-English Bazar",
    },
    {
      value: "52-Mothabari",
      label: "52-Mothabari",
    },
    {
      value: "53-Sujapur",
      label: "53-Sujapur",
    },
    {
      value: "54-Baisnabnagar",
      label: "54-Baisnabnagar",
    },
    {
      value: "55-Farakka",
      label: "55-Farakka",
    },
    {
      value: "56-Samserganj",
      label: "56-Samserganj",
    },
    {
      value: "57-Suti",
      label: "57-Suti",
    },
    {
      value: "58-Jangipur",
      label: "58-Jangipur",
    },
    {
      value: "59-Raghunathganj",
      label: "59-Raghunathganj",
    },
    {
      value: "60-Sagardighi",
      label: "60-Sagardighi",
    },
    {
      value: "61-Lalgola",
      label: "61-Lalgola",
    },
    {
      value: "62-Bhagabangola",
      label: "62-Bhagabangola",
    },
    {
      value: "63-Raninagar",
      label: "63-Raninagar",
    },
    {
      value: "64-Murshidabad",
      label: "64-Murshidabad",
    },
    {
      value: "65-Nabagram (SC)",
      label: "65-Nabagram (SC)",
    },
    {
      value: "66-Khargram (SC)",
      label: "66-Khargram (SC)",
    },
    {
      value: "67-Burwan (SC)",
      label: "67-Burwan (SC)",
    },
    {
      value: "68-Kandi",
      label: "68-Kandi",
    },
    {
      value: "69-Bharatpur",
      label: "69-Bharatpur",
    },
    {
      value: "70-Rejinagar",
      label: "70-Rejinagar",
    },
    {
      value: "71-Beldanga",
      label: "71-Beldanga",
    },
    {
      value: "72-Baharampur",
      label: "72-Baharampur",
    },
    {
      value: "73-Hariharpara",
      label: "73-Hariharpara",
    },
    {
      value: "74-Naoda",
      label: "74-Naoda",
    },
    {
      value: "75-Domkal",
      label: "75-Domkal",
    },
    {
      value: "76-Jalangi",
      label: "76-Jalangi",
    },
    {
      value: "77-Karimpur",
      label: "77-Karimpur",
    },
    {
      value: "78-Tehatta",
      label: "78-Tehatta",
    },
    {
      value: "79-Palashipara",
      label: "79-Palashipara",
    },
    {
      value: "80-Kaliganj",
      label: "80-Kaliganj",
    },
    {
      value: "81-Nakashipara",
      label: "81-Nakashipara",
    },
    {
      value: "82-Chapra",
      label: "82-Chapra",
    },
    {
      value: "83-Krishnanagar Uttar",
      label: "83-Krishnanagar Uttar",
    },
    {
      value: "84-Nabadwip",
      label: "84-Nabadwip",
    },
    {
      value: "85-Krishnanagar Dakshin",
      label: "85-Krishnanagar Dakshin",
    },
    {
      value: "86-Santipur",
      label: "86-Santipur",
    },
    {
      value: "87-Ranaghat Uttar Paschim",
      label: "87-Ranaghat Uttar Paschim",
    },
    {
      value: "88-Krishnaganj (SC)",
      label: "88-Krishnaganj (SC)",
    },
    {
      value: "89-Ranaghat Uttar Purba (SC)",
      label: "89-Ranaghat Uttar Purba (SC)",
    },
    {
      value: "90-Ranaghat Dakshin (SC)",
      label: "90-Ranaghat Dakshin (SC)",
    },
    {
      value: "91-Chakdaha",
      label: "91-Chakdaha",
    },
    {
      value: "92-Kalyani (SC)",
      label: "92-Kalyani (SC)",
    },
    {
      value: "93-Haringhata (SC)",
      label: "93-Haringhata (SC)",
    },
    {
      value: "94-Bagda (SC)",
      label: "94-Bagda (SC)",
    },
    {
      value: "95-Bangaon Uttar (SC)",
      label: "95-Bangaon Uttar (SC)",
    },
    {
      value: "96-Bangaon Dakshin (SC)",
      label: "96-Bangaon Dakshin (SC)",
    },
    {
      value: "97-Gaighata (SC)",
      label: "97-Gaighata (SC)",
    },
    {
      value: "98-Swarupnagar (SC)",
      label: "98-Swarupnagar (SC)",
    },
    {
      value: "99-Baduria",
      label: "99-Baduria",
    },
    {
      value: "100-Habra",
      label: "100-Habra",
    },
    {
      value: "101-Ashoknagar",
      label: "101-Ashoknagar",
    },
    {
      value: "102-Amdanga",
      label: "102-Amdanga",
    },
    {
      value: "103-Bijpur",
      label: "103-Bijpur",
    },
    {
      value: "104-Naihati",
      label: "104-Naihati",
    },
    {
      value: "105-Bhatpara",
      label: "105-Bhatpara",
    },
    {
      value: "106-Jagatdal",
      label: "106-Jagatdal",
    },
    {
      value: "107-Noapara",
      label: "107-Noapara",
    },
    {
      value: "108-Barrackpur",
      label: "108-Barrackpur",
    },
    {
      value: "109-Khardaha",
      label: "109-Khardaha",
    },
    {
      value: "110-Dum Dum Uttar",
      label: "110-Dum Dum Uttar",
    },
    {
      value: "111-Panihati",
      label: "111-Panihati",
    },
    {
      value: "112-Kamarhati",
      label: "112-Kamarhati",
    },
    {
      value: "113-Baranagar",
      label: "113-Baranagar",
    },
    {
      value: "114-Dum Dum",
      label: "114-Dum Dum",
    },
    {
      value: "115-Rajarhat New Town",
      label: "115-Rajarhat New Town",
    },
    {
      value: "116-Bidhannagar",
      label: "116-Bidhannagar",
    },
    {
      value: "117-Rajarhat Gopalpur",
      label: "117-Rajarhat Gopalpur",
    },
    {
      value: "118-Madhyamgram",
      label: "118-Madhyamgram",
    },
    {
      value: "119-Barasat",
      label: "119-Barasat",
    },
    {
      value: "120-Deganga",
      label: "120-Deganga",
    },
    {
      value: "121-Haroa",
      label: "121-Haroa",
    },
    {
      value: "122-Minakhan (SC)",
      label: "122-Minakhan (SC)",
    },
    {
      value: "123-Sandeshkhali (ST)",
      label: "123-Sandeshkhali (ST)",
    },
    {
      value: "124-Basirhat Dakshin",
      label: "124-Basirhat Dakshin",
    },
    {
      value: "125-Basirhat Uttar",
      label: "125-Basirhat Uttar",
    },
    {
      value: "126-Hingalganj (SC)",
      label: "126-Hingalganj (SC)",
    },
    {
      value: "127-Gosaba (SC)",
      label: "127-Gosaba (SC)",
    },
    {
      value: "128-Basanti (SC)",
      label: "128-Basanti (SC)",
    },
    {
      value: "129-Kultali (SC)",
      label: "129-Kultali (SC)",
    },
    {
      value: "130-Patharpratima",
      label: "130-Patharpratima",
    },
    {
      value: "131-Kakdwip",
      label: "131-Kakdwip",
    },
    {
      value: "132-Sagar",
      label: "132-Sagar",
    },
    {
      value: "133-Kulpi",
      label: "133-Kulpi",
    },
    {
      value: "134-Raidighi",
      label: "134-Raidighi",
    },
    {
      value: "135-Mandirbazar (SC)",
      label: "135-Mandirbazar (SC)",
    },
    {
      value: "136-Jaynagar (SC)",
      label: "136-Jaynagar (SC)",
    },
    {
      value: "137-Baruipur Purba (SC)",
      label: "137-Baruipur Purba (SC)",
    },
    {
      value: "138-Canning Paschim (SC)",
      label: "138-Canning Paschim (SC)",
    },
    {
      value: "139-Canning Purba",
      label: "139-Canning Purba",
    },
    {
      value: "140-Baruipur Paschim",
      label: "140-Baruipur Paschim",
    },
    {
      value: "141-Magrahat Purba (SC)",
      label: "141-Magrahat Purba (SC)",
    },
    {
      value: "142-Magrahat Paschim",
      label: "142-Magrahat Paschim",
    },
    {
      value: "143-Diamond Harbour",
      label: "143-Diamond Harbour",
    },
    {
      value: "144-Falta",
      label: "144-Falta",
    },
    {
      value: "145-Satgachhia",
      label: "145-Satgachhia",
    },
    {
      value: "146-Bishnupur, South 24 Parganas (SC)",
      label: "146-Bishnupur, South 24 Parganas (SC)",
    },
    {
      value: "147-Sonarpur Dakshin",
      label: "147-Sonarpur Dakshin",
    },
    {
      value: "148-Bhangar",
      label: "148-Bhangar",
    },
    {
      value: "149-Kasba",
      label: "149-Kasba",
    },
    {
      value: "150-Jadavpur",
      label: "150-Jadavpur",
    },
    {
      value: "151-Sonarpur Uttar",
      label: "151-Sonarpur Uttar",
    },
    {
      value: "152-Tollyganj",
      label: "152-Tollyganj",
    },
    {
      value: "153-Behala Purba",
      label: "153-Behala Purba",
    },
    {
      value: "154-Behala Paschim",
      label: "154-Behala Paschim",
    },
    {
      value: "155-Maheshtala",
      label: "155-Maheshtala",
    },
    {
      value: "156-Budge Budge",
      label: "156-Budge Budge",
    },
    {
      value: "157-Metiaburuz",
      label: "157-Metiaburuz",
    },
    {
      value: "158-Kolkata Port",
      label: "158-Kolkata Port",
    },
    {
      value: "159-Bhabanipur",
      label: "159-Bhabanipur",
    },
    {
      value: "160-Rashbehari",
      label: "160-Rashbehari",
    },
    {
      value: "161-Ballygunge",
      label: "161-Ballygunge",
    },
    {
      value: "162-Chowranghee",
      label: "162-Chowranghee",
    },
    {
      value: "163-Entally",
      label: "163-Entally",
    },
    {
      value: "164-Beleghata",
      label: "164-Beleghata",
    },
    {
      value: "165-Jorasanko",
      label: "165-Jorasanko",
    },
    {
      value: "166-Shyampukur",
      label: "166-Shyampukur",
    },
    {
      value: "167-Maniktola",
      label: "167-Maniktola",
    },
    {
      value: "168-Kashipur Belgachhia",
      label: "168-Kashipur Belgachhia",
    },
    {
      value: "169-Bally",
      label: "169-Bally",
    },
    {
      value: "170-Howrah Uttar",
      label: "170-Howrah Uttar",
    },
    {
      value: "171-Howrah Madhya",
      label: "171-Howrah Madhya",
    },
    {
      value: "172-Shibpur",
      label: "172-Shibpur",
    },
    {
      value: "173-Howrah Dakshin",
      label: "173-Howrah Dakshin",
    },
    {
      value: "174-Sankrail (SC)",
      label: "174-Sankrail (SC)",
    },
    {
      value: "175-Panchla",
      label: "175-Panchla",
    },
    {
      value: "176-Uluberia Purba",
      label: "176-Uluberia Purba",
    },
    {
      value: "177-Uluberia Uttar (SC)",
      label: "177-Uluberia Uttar (SC)",
    },
    {
      value: "178-Uluberia Dakshin",
      label: "178-Uluberia Dakshin",
    },
    {
      value: "179-Shyampur",
      label: "179-Shyampur",
    },
    {
      value: "180-Bagnan",
      label: "180-Bagnan",
    },
    {
      value: "181-Amta",
      label: "181-Amta",
    },
    {
      value: "182-Udaynarayanpur",
      label: "182-Udaynarayanpur",
    },
    {
      value: "183-Jagatballavpur",
      label: "183-Jagatballavpur",
    },
    {
      value: "184-Domjur",
      label: "184-Domjur",
    },
    {
      value: "185-Uttarpara",
      label: "185-Uttarpara",
    },
    {
      value: "186-Sreerampur",
      label: "186-Sreerampur",
    },
    {
      value: "187-Champdani",
      label: "187-Champdani",
    },
    {
      value: "188-Singur",
      label: "188-Singur",
    },
    {
      value: "189-Chandannagar",
      label: "189-Chandannagar",
    },
    {
      value: "190-Chunchura",
      label: "190-Chunchura",
    },
    {
      value: "191-Balagarh (SC)",
      label: "191-Balagarh (SC)",
    },
    {
      value: "192-Pandua",
      label: "192-Pandua",
    },
    {
      value: "193-Saptagram",
      label: "193-Saptagram",
    },
    {
      value: "194-Chanditala",
      label: "194-Chanditala",
    },
    {
      value: "195-Jangipara",
      label: "195-Jangipara",
    },
    {
      value: "196-Haripal",
      label: "196-Haripal",
    },
    {
      value: "197-Dhanekhali (SC)",
      label: "197-Dhanekhali (SC)",
    },
    {
      value: "198-Tarakeswar",
      label: "198-Tarakeswar",
    },
    {
      value: "199-Pursurah",
      label: "199-Pursurah",
    },
    {
      value: "200-Arambag (SC)",
      label: "200-Arambag (SC)",
    },
    {
      value: "201-Goghat (SC)",
      label: "201-Goghat (SC)",
    },
    {
      value: "202-Khanakul",
      label: "202-Khanakul",
    },
    {
      value: "203-Tamluk",
      label: "203-Tamluk",
    },
    {
      value: "204-Panskura Purba",
      label: "204-Panskura Purba",
    },
    {
      value: "205-Panskura Paschim",
      label: "205-Panskura Paschim",
    },
    {
      value: "206-Moyna",
      label: "206-Moyna",
    },
    {
      value: "207-Nandakumar",
      label: "207-Nandakumar",
    },
    {
      value: "208-Mahisadal",
      label: "208-Mahisadal",
    },
    {
      value: "209-Haldia (SC)",
      label: "209-Haldia (SC)",
    },
    {
      value: "210-Nandigram",
      label: "210-Nandigram",
    },
    {
      value: "211-Chandipur",
      label: "211-Chandipur",
    },
    {
      value: "212-Patashpur",
      label: "212-Patashpur",
    },
    {
      value: "213-Kanthi Uttar",
      label: "213-Kanthi Uttar",
    },
    {
      value: "214-Bhagabanpur",
      label: "214-Bhagabanpur",
    },
    {
      value: "215-Khejuri (SC)",
      label: "215-Khejuri (SC)",
    },
    {
      value: "216-Kanthi Dakshin",
      label: "216-Kanthi Dakshin",
    },
    {
      value: "217-Ramnagar, Purba Medinipur",
      label: "217-Ramnagar, Purba Medinipur",
    },
    {
      value: "218-Egra",
      label: "218-Egra",
    },
    {
      value: "219-Dantan",
      label: "219-Dantan",
    },
    {
      value: "220-Nayagram (ST)",
      label: "220-Nayagram (ST)",
    },
    {
      value: "221-Gopiballavpur",
      label: "221-Gopiballavpur",
    },
    {
      value: "222-Jhargram",
      label: "222-Jhargram",
    },
    {
      value: "223-Keshiary (ST)",
      label: "223-Keshiary (ST)",
    },
    {
      value: "224-Kharagpur Sadar",
      label: "224-Kharagpur Sadar",
    },
    {
      value: "225-Narayangarh",
      label: "225-Narayangarh",
    },
    {
      value: "226-Sabang",
      label: "226-Sabang",
    },
    {
      value: "227-Pingla",
      label: "227-Pingla",
    },
    {
      value: "228-Kharagpur",
      label: "228-Kharagpur",
    },
    {
      value: "229-Debra",
      label: "229-Debra",
    },
    {
      value: "230-Daspur",
      label: "230-Daspur",
    },
    {
      value: "231-Ghatal",
      label: "231-Ghatal",
    },
    {
      value: "232-Chandrakona (SC)",
      label: "232-Chandrakona (SC)",
    },
    {
      value: "233-Garbeta",
      label: "233-Garbeta",
    },
    {
      value: "234-Salboni",
      label: "234-Salboni",
    },
    {
      value: "235-Keshpur (SC)",
      label: "235-Keshpur (SC)",
    },
    {
      value: "236-Medinipur",
      label: "236-Medinipur",
    },
    {
      value: "237-Binpur (ST)",
      label: "237-Binpur (ST)",
    },
    {
      value: "238-Bandwan (ST)",
      label: "238-Bandwan (ST)",
    },
    {
      value: "239-Balarampur, Purulia",
      label: "239-Balarampur, Purulia",
    },
    {
      value: "240-Baghmundi",
      label: "240-Baghmundi",
    },
    {
      value: "241-Joypur, Purulia",
      label: "241-Joypur, Purulia",
    },
    {
      value: "242-Purulia",
      label: "242-Purulia",
    },
    {
      value: "243-Manbazar (ST)",
      label: "243-Manbazar (ST)",
    },
    {
      value: "244-Kashipur",
      label: "244-Kashipur",
    },
    {
      value: "245-Para (SC)",
      label: "245-Para (SC)",
    },
    {
      value: "246-Raghunathpur, Purulia (SC)",
      label: "246-Raghunathpur, Purulia (SC)",
    },
    {
      value: "247-Saltora (SC)",
      label: "247-Saltora (SC)",
    },
    {
      value: "248-Chhatna",
      label: "248-Chhatna",
    },
    {
      value: "249-Ranibandh (ST)",
      label: "249-Ranibandh (ST)",
    },
    {
      value: "250-Raipur, Bankura (ST)",
      label: "250-Raipur, Bankura (ST)",
    },
    {
      value: "251-Taldangra",
      label: "251-Taldangra",
    },
    {
      value: "252-Bankura",
      label: "252-Bankura",
    },
    {
      value: "253-Barjora",
      label: "253-Barjora",
    },
    {
      value: "254-Onda",
      label: "254-Onda",
    },
    {
      value: "255-Bishnupur, Bankura",
      label: "255-Bishnupur, Bankura",
    },
    {
      value: "256-Katulpur (SC)",
      label: "256-Katulpur (SC)",
    },
    {
      value: "257-Indas (SC)",
      label: "257-Indas (SC)",
    },
    {
      value: "258-Sonamukhi (SC)",
      label: "258-Sonamukhi (SC)",
    },
    {
      value: "259-Khandaghosh (SC)",
      label: "259-Khandaghosh (SC)",
    },
    {
      value: "260-Burdwan Dakshin",
      label: "260-Burdwan Dakshin",
    },
    {
      value: "261-Raina (SC)",
      label: "261-Raina (SC)",
    },
    {
      value: "262-Jamalpur (SC)",
      label: "262-Jamalpur (SC)",
    },
    {
      value: "263-Manteswar",
      label: "263-Manteswar",
    },
    {
      value: "264-Kalna (SC)",
      label: "264-Kalna (SC)",
    },
    {
      value: "265-Memari",
      label: "265-Memari",
    },
    {
      value: "266-Burdwan Uttar (SC)",
      label: "266-Burdwan Uttar (SC)",
    },
    {
      value: "267-Bhatar",
      label: "267-Bhatar",
    },
    {
      value: "268-Purbasthali Dakshin",
      label: "268-Purbasthali Dakshin",
    },
    {
      value: "269-Purbasthali Uttar",
      label: "269-Purbasthali Uttar",
    },
    {
      value: "270-Katwa",
      label: "270-Katwa",
    },
    {
      value: "271-Ketugram",
      label: "271-Ketugram",
    },
    {
      value: "272-Mangalkot",
      label: "272-Mangalkot",
    },
    {
      value: "273-Ausgram (SC)",
      label: "273-Ausgram (SC)",
    },
    {
      value: "274-Galsi (SC)",
      label: "274-Galsi (SC)",
    },
    {
      value: "275-Pandaveswar",
      label: "275-Pandaveswar",
    },
    {
      value: "276-Durgapur Purba",
      label: "276-Durgapur Purba",
    },
    {
      value: "277-Durgapur Paschim",
      label: "277-Durgapur Paschim",
    },
    {
      value: "278-Raniganj",
      label: "278-Raniganj",
    },
    {
      value: "279-Jamuria",
      label: "279-Jamuria",
    },
    {
      value: "280-Asansol Dakshin",
      label: "280-Asansol Dakshin",
    },
    {
      value: "281-Asansol Uttar",
      label: "281-Asansol Uttar",
    },
    {
      value: "282-Kulti",
      label: "282-Kulti",
    },
    {
      value: "283-Barabani",
      label: "283-Barabani",
    },
    {
      value: "284-Dubrajpur (SC)",
      label: "284-Dubrajpur (SC)",
    },
    {
      value: "285-Suri",
      label: "285-Suri",
    },
    {
      value: "286-Bolpur",
      label: "286-Bolpur",
    },
    {
      value: "287-Nanoor (SC)",
      label: "287-Nanoor (SC)",
    },
    {
      value: "288-Labhpur",
      label: "288-Labhpur",
    },
    {
      value: "289-Sainthia (SC)",
      label: "289-Sainthia (SC)",
    },
    {
      value: "290-Mayureswar",
      label: "290-Mayureswar",
    },
    {
      value: "291-Rampurhat",
      label: "291-Rampurhat",
    },
    {
      value: "292-Hansan",
      label: "292-Hansan",
    },
    {
      value: "293-Nalhati",
      label: "293-Nalhati",
    },
    {
      value: "294-Murarai",
      label: "294-Murarai",
    },
    {
      value: "3-Jalpaiguri (SC)",
      label: "3-Jalpaiguri (SC)",
    },
    {
      value: "1-Cooch Behar (SC)",
      label: "1-Cooch Behar (SC)",
    },
    {
      value: "2-Alipurduars (ST)",
      label: "2-Alipurduars (ST)",
    },
    {
      value: "4-Darjeeling",
      label: "4-Darjeeling",
    },
    {
      value: "5-Raiganj",
      label: "5-Raiganj",
    },
    {
      value: "6-Balurghat",
      label: "6-Balurghat",
    },
    {
      value: "7-Maldaha Uttar",
      label: "7-Maldaha Uttar",
    },
    {
      value: "8-Maldaha Dakshin",
      label: "8-Maldaha Dakshin",
    },
    {
      value: "9-Jangipur",
      label: "9-Jangipur",
    },
    {
      value: "11-Murshidabad",
      label: "11-Murshidabad",
    },
    {
      value: "10-Baharampur",
      label: "10-Baharampur",
    },
    {
      value: "12-Krishnanagar",
      label: "12-Krishnanagar",
    },
    {
      value: "13-Ranaghat (SC)",
      label: "13-Ranaghat (SC)",
    },
    {
      value: "14-Bangaon (SC)",
      label: "14-Bangaon (SC)",
    },
    {
      value: "18-Basirhat",
      label: "18-Basirhat",
    },
    {
      value: "17-Barasat",
      label: "17-Barasat",
    },
    {
      value: "15-Barrackpore",
      label: "15-Barrackpore",
    },
    {
      value: "16-Dum Dum",
      label: "16-Dum Dum",
    },
    {
      value: "19-Jaynagar (SC)",
      label: "19-Jaynagar (SC)",
    },
    {
      value: "20-Mathurapur (SC)",
      label: "20-Mathurapur (SC)",
    },
    {
      value: "22-Jadavpur",
      label: "22-Jadavpur",
    },
    {
      value: "21-Diamond Harbour",
      label: "21-Diamond Harbour",
    },
    {
      value: "23-Kolkata Dakshin",
      label: "23-Kolkata Dakshin",
    },
    {
      value: "24-Kolkata Uttar",
      label: "24-Kolkata Uttar",
    },
    {
      value: "25-Howrah",
      label: "25-Howrah",
    },
    {
      value: "26-Uluberia",
      label: "26-Uluberia",
    },
    {
      value: "27-Srerampur",
      label: "27-Srerampur",
    },
    {
      value: "28-Hooghly",
      label: "28-Hooghly",
    },
    {
      value: "29-Arambagh (SC)",
      label: "29-Arambagh (SC)",
    },
    {
      value: "30-Tamluk",
      label: "30-Tamluk",
    },
    {
      value: "32-Ghatal",
      label: "32-Ghatal",
    },
    {
      value: "31-Kanthi",
      label: "31-Kanthi",
    },
    {
      value: "34-Medinipur",
      label: "34-Medinipur",
    },
    {
      value: "33-Jhargram (ST)",
      label: "33-Jhargram (ST)",
    },
    {
      value: "35-Purulia",
      label: "35-Purulia",
    },
    {
      value: "36-Bankura",
      label: "36-Bankura",
    },
    {
      value: "37-Bishnupur (SC)",
      label: "37-Bishnupur (SC)",
    },
    {
      value: "39-Bardhaman Durgapur",
      label: "39-Bardhaman Durgapur",
    },
    {
      value: "38-Bardhaman Purba (SC)",
      label: "38-Bardhaman Purba (SC)",
    },
    {
      value: "41-Bolpur (SC)",
      label: "41-Bolpur (SC)",
    },
    {
      value: "40-Asansol",
      label: "40-Asansol",
    },
    {
      value: "42-Birbhum",
      label: "42-Birbhum",
    },
    {
      value: "Cooch Behar",
      label: "Cooch Behar",
    },
    {
      value: "Alipurduar",
      label: "Alipurduar",
    },
    {
      value: "Jalpaiguri",
      label: "Jalpaiguri",
    },
    {
      value: "Kalimpong",
      label: "Kalimpong",
    },
    {
      value: "Darjeeling",
      label: "Darjeeling",
    },
    {
      value: "Uttar Dinajpur",
      label: "Uttar Dinajpur",
    },
    {
      value: "Dakshin Dinajpur",
      label: "Dakshin Dinajpur",
    },
    {
      value: "Malda",
      label: "Malda",
    },
    {
      value: "Murshidabad",
      label: "Murshidabad",
    },
    {
      value: "Nadia",
      label: "Nadia",
    },
    {
      value: "North 24 Parganas",
      label: "North 24 Parganas",
    },
    {
      value: "South 24 Parganas",
      label: "South 24 Parganas",
    },
    {
      value: "Kolkata",
      label: "Kolkata",
    },
    {
      value: "Howrah",
      label: "Howrah",
    },
    {
      value: "Hooghly",
      label: "Hooghly",
    },
    {
      value: "Purba Medinipur",
      label: "Purba Medinipur",
    },
    {
      value: "Paschim Medinipur",
      label: "Paschim Medinipur",
    },
    {
      value: "Jhargram",
      label: "Jhargram",
    },
    {
      value: "Purulia",
      label: "Purulia",
    },
    {
      value: "Bankura",
      label: "Bankura",
    },
    {
      value: "Purba Bardhaman",
      label: "Purba Bardhaman",
    },
    {
      value: "Paschim Bardhaman",
      label: "Paschim Bardhaman",
    },
    {
      value: "Birbhum",
      label: "Birbhum",
    },
    {
      value: "Uttar Banga",
      label: "Uttar Banga",
    },
    {
      value: "Nabadwip",
      label: "Nabadwip",
    },
    {
      value: "Kolkata",
      label: "Kolkata",
    },
    {
      value: "HHM",
      label: "HHM",
    },
    {
      value: "Rarh",
      label: "Rarh",
    },
  ];

  const customStyles = {
    indicatorSeparator: (provided, state) => ({
      ...provided,
      display:
        state.selectProps.value && state.selectProps.value.length > 0
          ? "block"
          : "none",
    }),
    control: (provided, state) => ({
      ...provided,
      border: state.isFocused ? "2px solid #4CAF50" : "2px solid #ccc",
      borderRadius: "4px",
      boxShadow: state.isFocused ? "0 0 5px rgba(76, 175, 80, 0.7)" : "none",
      cursor: "pointer",
    }),
  };

  return (
    <>
      <div className="container">
        <div className="login" style={{ width: "330px", marginTop: "10px" }}>
          <img src={img} className="img" alt="STC Logo" />
          <h1>Sign Up</h1>
          <form onSubmit={handleSubmit} style={{ alignItems: "center" }}>
            <input
              type="text"
              placeholder="Enter Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              style={{ width: "300px" }}
            />
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "300px" }}
            />
            <div
              className="password-input"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                marginBottom: "20px",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "300px" }}
              />
              <div
                className="eye-icon"
                onClick={toggleShowPassword}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </div>
            </div>

            {/* State Dropdown */}
            <div
              className="state-dropdown"
              style={{ width: "300px", marginBottom: "20px" }}
            >
              <label
                style={{
                  marginBottom: "5px",
                  textAlign: "center",
                  color: "black",
                }}
              >
                Select State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                required
                style={{ width: "100%", padding: "8px", borderRadius: "5px" }}
              >
                <option value="" disabled>
                  Select State
                </option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Bengal">Bengal</option>
              </select>
            </div>

            <div
              className="roles"
              style={{
                width: "300px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label
                style={{
                  marginBottom: "5px",
                  textAlign: "center",
                  color: "black",
                }}
              >
                Select Roles
              </label>
              <Select
                isMulti
                options={roleOptions}
                value={roleOptions.filter((role) => roles.includes(role.value))}
                onChange={handleRoleChange}
                styles={customStyles}
              />
            </div>

            <div className="bttn">
              <button type="submit" className="button">
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
