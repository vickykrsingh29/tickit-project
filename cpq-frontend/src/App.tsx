import React from "react";
import {
  Route,
  BrowserRouter as Router,
  Switch,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import CustomersTable from "./components/CustomersTable";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import ProductsTable from "./components/ProductsTable";
import ProtectedRoute from "./components/ProtectedRoute";
import QuotesTable from "./components/QuotesTable";
import TransactionsTable from "./components/TransactionsTable";
import UsersTable from "./components/UsersTable";
import AddNewQuote from "./pages/AddNewQuote";
import CustomerDetailsPage from "./pages/CustomerDetailsPage";
import Licenses from "./pages/Licenses";
import LandingPage from "./pages/LandingPage";
import NewUserRegisterPage from "./pages/NewUserRegisterPage";
import PendingAdminApproval from "./pages/PendingAdminApproval";
import Pricing from "./pages/Pricing";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import Profile from "./pages/Profile";
import QuoteDetailsPage from "./pages/QuoteDetailsPage";
import Settings from "./pages/Settings";
import Test from "./pages/Test";
import OrderTablePage from "./pages/orderManagement/OrderTablePage";
import AddNewOrderFormPage from "./pages/orderManagement/AddNewOrderFormPage";
import OrderDetailPage from "./pages/orderManagement/OrderDetailPage";
import ProductsSupplied from "./pages/ProductsSupplied";
import LiaisoningRequests from "./pages/LiaisoningRequests";
import LicenseDetails from "./pages/LicenseDetails";
import EditOrderFormPage from "./pages/orderManagement/EditOrderFormPage";

const App: React.FC = () => {
  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Main />
    </Router>
  );
};

const Main: React.FC = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

  return (
    <div className="flex">
      {!hideNavbar && <Navbar />}
      <div className="flex-auto">
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/products" component={ProductsTable} />
          <ProtectedRoute path="/products-supplied" component={ProductsSupplied} />
          <ProtectedRoute path="/customers" component={CustomersTable} />
          <ProtectedRoute path="/quotes" component={QuotesTable} />
          <ProtectedRoute
            path="/product-details"
            component={ProductDetailsPage}
          />
          <ProtectedRoute
            path="/customer-details"
            component={CustomerDetailsPage}
          />
          <ProtectedRoute path="/quote-details" component={QuoteDetailsPage} />
          <ProtectedRoute path="/pricing" component={Pricing} />
          <ProtectedRoute path="/add-new-quote" component={AddNewQuote} />
          <ProtectedRoute path="/transactions" component={TransactionsTable} />
          <ProtectedRoute path="/users" component={UsersTable} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/settings" component={Settings} />
          <ProtectedRoute path="/orders" component={OrderTablePage} />
          <ProtectedRoute path="/edit-order/:orderID" component={EditOrderFormPage} />
          <ProtectedRoute path="/add-new-order-form" component={AddNewOrderFormPage} />
          <ProtectedRoute path="/order-details" component={OrderDetailPage} />
          <ProtectedRoute path="/licenses/:licenseId" component={LicenseDetails}/>
          <ProtectedRoute path="/licenses" component={Licenses}/>
          <ProtectedRoute path="/liaisoning-requests" component={LiaisoningRequests} />
          <Route path="/register" component={NewUserRegisterPage} />
          <Route path="/approval-pending" component={PendingAdminApproval} />
          <ProtectedRoute path="/test" component={Test} />
          <Route
            path="*"
            component={() => (
              <div className="flex items-center justify-center min-h-screen">
                404 Not Found
              </div>
            )}
          />
        </Switch>
      </div>
    </div>
  );
};

export default App;
