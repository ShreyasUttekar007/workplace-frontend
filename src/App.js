import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import UpdateLogin from "./components/UpdateLogin";
import Register from "./components/Register";
import CreateMom from "./components/CreateMom";
import MomData from "./components/MomData";
import EditMom from "./components/EditMom";
import ViewMom from "./components/ViewMom";
import UserDashboard from "./components/UserDashboard";
import CreatePcReport from "./components/CreatePcReport";
import Report from "./components/Report";
import UpdateReport from "./components/UpdateReport";
import Form20 from "./components/Form20";
import Form17 from "./components/Form17";
import Form20Dashboard from "./components/Form20Dashboard";
import Form17Dashboard from "./components/Form17Dashboard";
import Gatt from "./components/Gatt";
import GattDashboard from "./components/GattDashboard";
import CasteDashboard from "./components/CasteDashboard";
import BoothList from "./components/BoothList";
import StateDashboard from "./components/StateDashboard";
import CreateMediaScan from "./components/CreateMediaScan";
import MediaScan from "./components/MediaScan";
import CreateIDI from "./components/CreateIDI";
import DataIDI from "./components/DataIDI";
import UpdateIDI from "./components/UpdateIDI";
import WelcomePage from "./components/WelcomePage";
import NewCreateMom from "./components/NewCreateMom";
import SurveyDashboard from "./components/SurveyDashboard";
import CandidateList from "./components/CandidateList";
import UpdateUser from "./components/UpdateUser";
import EmployeeData from "./components/EmployeeData";
import LeaveForm from "./components/LeaveRequest";
import LeaveRequestsTable from "./components/LeaveRequestsTable";
import LeaveRequestsAdmin from "./components/LeaveRequestsAdmin";
import LeaveSection from "./components/LeaveSection";
import BmcInterventions from "./components/BmcInterventions";
import BmcInterventionDashboard from "./components/BmcInterventionDashboard";
import UpdateBmcIntervention from "./components/UpdateBmcIntervention";
import StateInterventions from "./components/StateInterventions";
import StateInterventionDashboard from "./components/StateInterventionDashboard";
import UpdateStateIntervention from "./components/UpdateStateIntervention";
import RequestTravel from "./components/RequestTravel";
import TravelRequestUserData from "./components/TravelRequestUserData";
import TravelRequestAdmin from "./components/TravelRequestAdmin";
import TravelSection from "./components/TravelSection";
import TravelDataOpsTeam from "./components/TravelDataOpsTeam";
import LeaveRequestsRM from "./components/LeaveRequestsRM";
import MahaHolidayCalendar from "./components/MahaHolidayCalendar";
import UpdateCabRequests from "./components/UpdateCabRequests";
import CabDashboard from "./components/CabDashboard";
import UpdateDriverData from "./components/UpdateDriverData";
import CabSection from "./components/CabSection";
import CabForm from "./components/CabForm";
import DownloadCSV from "./components/DownloadCSV";
import DynamicNewMom from "./components/DynamicNewMom";
import UpdateBmcUserIntervention from "./components/UpdateBmcUserIntervention";
import ListNewMom from "./components/ListNewMom";
import ViewNewMom from "./components/ViewNewMom";
import LeaderMeetingSection from "./components/LeaderMeetingSection";
import UpdateDynamicMom from "./components/UpdateDynamicMom";
import CabRequestsRM from "./components/CabRequestsRM";
import MomSummaryTable from "./components/MomSummaryTable";
import TestAuthStatus from "./test/TestAuthStatus";
import ProbableJoinees from "./components/ProbableJoinees";
import AddProbableJoinees from "./components/AddProbableJoinees";
import UpdateProbableJoinee from "./components/UpdateProbableJoinees";
import ProbableJoineesSection from "./components/ProbableJoineesSection";
import GTMPageView from "./components/GTMPageView";
import UpdateUserPassword from "./components/UpdateUserPassword";
import JoineeSummaryTable from "./components/JoineeSummaryTable";
import MumbaiCastes from "./components/MumbaiCastes";
import AddCandidatesForm from "./components/CandidatesDailyActivity";
import CandidatesDailyActivity from "./components/CandidatesDailyActivity";
const App = () => {
  return (
    <Router>
      <GTMPageView />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/update-user/:userId"
          element={<ProtectedRoute element={<UpdateUser />} />}
        />
        <Route
          path="/update-user-password/:userId"
          element={<ProtectedRoute element={<UpdateUserPassword />} />}
        />
        <Route path="/update" element={<UpdateLogin />} />
        <Route
          path="/nWuRGm1GvLXyCmQ6TbxqfQ7YasvDlY8z87TxUHrX0HUhX0Pxa9"
          element={<ProtectedRoute element={<Register />} />}
        />
        <Route
          path="/createMom"
          element={<ProtectedRoute element={<CreateMom />} />}
        />
        <Route
          path="/new-create-mom"
          element={<ProtectedRoute element={<NewCreateMom />} />}
        />
        <Route
          path="/create-idi"
          element={<ProtectedRoute element={<CreateIDI />} />}
        />
        <Route
          path="/welcome"
          element={<ProtectedRoute element={<WelcomePage />} />}
        />
        <Route
          path="/createacreport"
          element={<ProtectedRoute element={<CreatePcReport />} />}
        />
        <Route
          path="/create-media-scan"
          element={<ProtectedRoute element={<CreateMediaScan />} />}
        />
        <Route
          path="/create-form20"
          element={<ProtectedRoute element={<Form20 />} />}
        />
        <Route
          path="/leave-form"
          element={<ProtectedRoute element={<LeaveForm />} />}
        />
        <Route
          path="/bmc-form"
          element={<ProtectedRoute element={<BmcInterventions />} />}
        />
        <Route
          path="/leave-section"
          element={<ProtectedRoute element={<LeaveSection />} />}
        />
        <Route
          path="/travel-section"
          element={<ProtectedRoute element={<TravelSection />} />}
        />
        <Route
          path="/leave-data"
          element={<ProtectedRoute element={<LeaveRequestsTable />} />}
        />
        <Route
          path="/leave-data-admin"
          element={<ProtectedRoute element={<LeaveRequestsAdmin />} />}
        />
        <Route
          path="/leave-data-rm"
          element={<ProtectedRoute element={<LeaveRequestsRM />} />}
        />
        <Route
          path="/idi-data"
          element={<ProtectedRoute element={<DataIDI />} />}
        />
        <Route
          path="/form20-dashboard"
          element={<ProtectedRoute element={<Form20Dashboard />} />}
        />
        <Route
          path="/media-scan"
          element={<ProtectedRoute element={<MediaScan />} />}
        />
        <Route
          path="/create-form17"
          element={<ProtectedRoute element={<Form17 />} />}
        />
        <Route
          path="/form17-dashboard"
          element={<ProtectedRoute element={<Form17Dashboard />} />}
        />
        <Route
          path="/gatt-gann"
          element={<ProtectedRoute element={<Gatt />} />}
        />
        <Route
          path="/gatt-gannn-dashboard"
          element={<ProtectedRoute element={<GattDashboard />} />}
        />
        <Route
          path="/caste-dashboard"
          element={<ProtectedRoute element={<CasteDashboard />} />}
        />
        <Route
          path="/booth-list"
          element={<ProtectedRoute element={<BoothList />} />}
        />
        <Route
          path="/state-dashboard"
          element={<ProtectedRoute element={<StateDashboard />} />}
        />
        <Route
          path="/survey-dashboard"
          element={<ProtectedRoute element={<SurveyDashboard />} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/userdashboard"
          element={<ProtectedRoute element={<UserDashboard />} />}
        />
        <Route
          path="/candidate-list"
          element={<ProtectedRoute element={<CandidateList />} />}
        />
        <Route
          path="/momdata"
          element={<ProtectedRoute element={<MomData />} />}
        />
        <Route
          path="/reportdata"
          element={<ProtectedRoute element={<Report />} />}
        />
        <Route
          path="/viewmom/:momId"
          element={<ProtectedRoute element={<ViewMom />} />}
        />
        <Route
          path="/update-mom/:momId"
          element={<ProtectedRoute element={<EditMom />} />}
        />
        <Route
          path="/update-idi/:momId"
          element={<ProtectedRoute element={<UpdateIDI />} />}
        />
        <Route
          path="/update-report/:momId"
          element={<ProtectedRoute element={<UpdateReport />} />}
        />
        <Route
          path="/emp-data"
          element={<ProtectedRoute element={<EmployeeData />} />}
        />
        <Route
          path="/bmc-intervention-dashboard"
          element={<ProtectedRoute element={<BmcInterventionDashboard />} />}
        />
        <Route
          path="/update-bmc-intervention/:interventionId"
          element={<ProtectedRoute element={<UpdateBmcIntervention />} />}
        />
        <Route
          path="/update-bmc-user-intervention/:interventionId"
          element={<ProtectedRoute element={<UpdateBmcUserIntervention />} />}
        />
        <Route
          path="/update-state-intervention/:interventionId"
          element={<ProtectedRoute element={<UpdateStateIntervention />} />}
        />
        <Route
          path="/state-interventions"
          element={<ProtectedRoute element={<StateInterventions />} />}
        />
        <Route
          path="/state-intervention-dashboard"
          element={<ProtectedRoute element={<StateInterventionDashboard />} />}
        />
        <Route
          path="/request-travel"
          element={<ProtectedRoute element={<RequestTravel />} />}
        />
        <Route
          path="/travel-request-user-data"
          element={<ProtectedRoute element={<TravelRequestUserData />} />}
        />
        <Route
          path="/travel-request-admin-data"
          element={<ProtectedRoute element={<TravelRequestAdmin />} />}
        />
        <Route
          path="/travel-request-ops-data"
          element={<ProtectedRoute element={<TravelDataOpsTeam />} />}
        />
        <Route
          path="/maha-holiday-calendar"
          element={<ProtectedRoute element={<MahaHolidayCalendar />} />}
        />
        <Route
          path="/cab-request"
          element={<ProtectedRoute element={<CabForm />} />}
        />
        <Route
          path="/cab-section"
          element={<ProtectedRoute element={<CabSection />} />}
        />
        <Route
          path="/cab-requests-rm"
          element={<ProtectedRoute element={<CabRequestsRM />} />}
        />
        <Route
          path="/update-cab-request/:momId"
          element={<ProtectedRoute element={<UpdateCabRequests />} />}
        />
        <Route
          path="/update-driver-data/:momId"
          element={<ProtectedRoute element={<UpdateDriverData />} />}
        />
        <Route
          path="/cab-dashboard"
          element={<ProtectedRoute element={<CabDashboard />} />}
        />
        <Route
          path="/cab-data-csv"
          element={<ProtectedRoute element={<DownloadCSV />} />}
        />
        <Route
          path="/new-mom"
          element={<ProtectedRoute element={<DynamicNewMom />} />}
        />
        <Route
          path="/list-new-mom"
          element={<ProtectedRoute element={<ListNewMom />} />}
        />
        <Route
          path="/view-new-mom/:momId"
          element={<ProtectedRoute element={<ViewNewMom />} />}
        />
        <Route
          path="/meeting-section"
          element={<ProtectedRoute element={<LeaderMeetingSection />} />}
        />
        <Route
          path="/update-new-mom/:momId"
          element={<ProtectedRoute element={<UpdateDynamicMom />} />}
        />
        <Route
          path="/new-mom-summary"
          element={<ProtectedRoute element={<MomSummaryTable />} />}
        />
        <Route
          path="/probable-joinees"
          element={<ProtectedRoute element={<ProbableJoinees />} />}
        />
        <Route
          path="/add-probable-joinees"
          element={<ProtectedRoute element={<AddProbableJoinees />} />}
        />
        <Route
          path="/probable-joinees-section"
          element={<ProtectedRoute element={<ProbableJoineesSection />} />}
        />
        <Route
          path="/probable-joinees-summary"
          element={<ProtectedRoute element={<JoineeSummaryTable />} />}
        />
        <Route
          path="/update-new-joinee/:joineeId"
          element={<ProtectedRoute element={<UpdateProbableJoinee />} />}
        />
        <Route
          path="/mumbai-castes"
          element={<ProtectedRoute element={<MumbaiCastes />} />}
        />
        <Route
          path="/add-candidates-daily-activity"
          element={<ProtectedRoute element={<CandidatesDailyActivity />} />}
        />
        <Route path="/test-auth" element={<TestAuthStatus />} />
      </Routes>
    </Router>
  );
};

export default App;
