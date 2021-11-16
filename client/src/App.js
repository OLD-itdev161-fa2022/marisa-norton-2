import React from "react";
import axios from "axios";
import "./App.css";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom";


class App extends React.Component {

  state = {
    posts: [],
    post: null,
    token: null,
    user: null
  };

  componentDidMount(){
    this.authenticateUser();
}

authenticateUser = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.removeItem("user")
    this.setState({user: null});
  }
  if (token) {
    const config = {
      headers: {
        "x-auth-token": token
      }
    }
    axios.get("http://localhost:5000/api/auth", config)
    .then((response) => {
      localStorage.setItem("user", response.data.name)
      this.setState({
        user: response.data.name,
        token: token
      }, () => {
        this.loadData();
      }
      );
    })
    .catch((error) => {
      localStorage.removeItem("user");
      this.setState({user: null});
      console.error(`Error logging in: ${error}`);
    });
  }
}

loadData = () => {
  const {token} = this.state;
  if (token) {
    const config = {
      headers:{
        "x-auth-token": token
      }
    };
    axios.get("http://localhost:5000/api/posts", config)
    .then((response) => {
      this.setState({
        posts: response.data
      });
    })
    .catch((error) => {
      console.log(`Error fetching data: ${error}`)
    });
  }
}

viewPost = (post) => {
  console.log(`view ${post.title}`);
  this.setState({
    post: post
  });
}

deletePost = post => {
  const {token} = this.state;

  if (token) {
    const config = {
      headers: {
        "x-auth-token": token
      }
    };
    axios.delete(` http://localhost:5000/api/posts/${post._id}`, config)
    .then( response => {
      const newPosts = this.state.posts.filter(p => p._id !== post._id);
      this.setState({
        posts: [...newPosts]
      });
    })
    .catch(error => {
      console.log(`Error deleting post: ${error}`);
    });
  }
}

editPost = post => {
  this.setState({
    post: post
  });
}

onPostCreated = post => {
  const newPosts = [...this.state.posts, post];
  
  this.setState({
    posts: newPosts
  });
}

onPostUpdate = post => {
  console.log("updated post: ", post);
  const newPosts = [...this.state.posts];
  const index = newPosts.findIndex(p => p._id === post._id);

  newPosts[index] = post;
  this.setState({
    posts: newPosts
  });
}

logOut = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  this.setState({user: null, token: null});
}

//render starts
  render(){
    let {user, data} = this.state;
    const authProps = { 
      authenticateUser: this.authenticateUser
    }
    return(
      <Router>
      <div className="App">
        <header className="App-header">
          <h1>Good Things</h1>
          <ul>
            <li>
              <Link to ="/">Home</Link>
            </li>
            <li>
              <Link to ="/register">Register</Link>
            </li>
            <li>
            {user ? <Link to= "" onClick = {this.logOut}>Log out</Link> :
              <Link to ="/login">Login</Link>
            }
            </li>
          </ul>
        </header>
        <main>
          <Switch>
          <Route exact path="/">
          { user ? (
            <React.Fragment>
              <div className ="greeting">Hello {user} </div>
              <div>{data}</div>
              
            </React.Fragment>
          ) : (
            <React.Fragment>
              Please Register or Login
            </React.Fragment>
          )}
          </Route>

          
          <Route exact path="/register" 
            render = {() => <Register {...authProps}/>}
          />
          
          <Route exact path="/login" 
          render = {() => <Login {...authProps}/>}
          />

          </Switch>
        </main>
      </div>
    </Router>
    );
  }
}

export default App;