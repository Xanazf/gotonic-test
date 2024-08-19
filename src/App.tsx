import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import SigninPage from "@/pages/signin";
import SignupPage from "@/pages/signup";
import SignoutPage from "@/pages/signout";
import CreatePage from "@/pages/create";
import OrderPage from "@/pages/order";
import DeliveryPage from "@/pages/delivery";
import RequestsPage from "@/pages/requests";


function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<SigninPage />} path="/signin" />
      <Route element={<SignupPage />} path="/signup" />
      <Route element={<SignoutPage />} path="/signout" />
      <Route element={<CreatePage />} path="/create" />
      <Route element={<OrderPage />} path="/create/order" />
      <Route element={<DeliveryPage />} path="/create/delivery" />
      <Route element={<RequestsPage />} path="/requests" />
    </Routes>
  );
}

export default App;
