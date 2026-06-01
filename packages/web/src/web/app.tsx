import { Route, Switch } from "wouter";
import Index from "./pages/index";
import CreatePage from "./pages/create";
import SuccessPage from "./pages/success";
import VerifyPage from "./pages/verify";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/create" component={CreatePage} />
        <Route path="/success/:id" component={SuccessPage} />
        <Route path="/v/:id" component={VerifyPage} />
      </Switch>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
