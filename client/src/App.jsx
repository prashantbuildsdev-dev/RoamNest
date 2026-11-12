import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ListingDetails from "./pages/ListingDetails";
import NewListing from "./pages/NewListing";
import EditListing from "./pages/EditListing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Footer from "./components/Footer";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import { MessageProvider } from "./context/MessageContext";
import "./App.css";

function App() {

    return (
        <MessageProvider>

            <>

                <Routes>

                    <Route path="/" element={<Home />} />

                    <Route path="/listings/new" element={<NewListing />} />

                    <Route path="/listings/:id/edit" element={<EditListing />} />

                    <Route path="/listings/:id" element={<ListingDetails />} />

                    <Route path="/login" element={<Login />} />

                    <Route path="/signup" element={<Signup />} />

                    <Route path="/listings/:id/book" element={<Booking />} />

                    <Route path="/my-bookings" element={<MyBookings />} />

                    <Route
                        path="*"
                        element={<h2 style={{ textAlign: "center", marginTop: "50px" }}>404 - Page Not Found</h2>}
                    />

                </Routes>

                <Footer />

            </>

        </MessageProvider>
    );

}

export default App;