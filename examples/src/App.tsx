import "./App.css";
import { getFirestore, where } from "firebase/firestore";
import {
  addUser,
  getUser,
  queryUsers,
  setUser,
} from "../generated/user/firestore";

interface FormElements extends HTMLFormControlsCollection {
  name: HTMLInputElement;
  email: HTMLInputElement;
  id: HTMLInputElement;
}
interface UserFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

function App({ db }: { db: ReturnType<typeof getFirestore> }) {
  return (
    <>
      <h1>Firestore</h1>
      <div>
        <form
          onSubmit={async (e: React.FormEvent<UserFormElement>) => {
            e.preventDefault();
            const name = e.currentTarget.elements.name.value;
            const email = e.currentTarget.elements.email.value;
            await addUser(db, {
              name,
              email,
            });
          }}
        >
          <p>Add User</p>
          <input type="text" id="name" placeholder="Name" />
          <input type="email" id="email" placeholder="Email" />
          <button type="submit">Add</button>
        </form>
      </div>

      <div>
        <form
          onSubmit={async (e: React.FormEvent<UserFormElement>) => {
            e.preventDefault();
            const id = e.currentTarget.elements.id.value;
            const user = await getUser(db, id);
            console.log(user);
          }}
        >
          <p>Get User</p>
          <input type="text" id="id" placeholder="ID" />
          <button type="submit">Get</button>
        </form>
      </div>

      <div>
        <form
          onSubmit={async (e: React.FormEvent<UserFormElement>) => {
            e.preventDefault();
            const name = e.currentTarget.elements.name.value;
            const users = await queryUsers(db)(where("name", "==", name));
            console.log(users);
          }}
        >
          <p>Query User</p>
          <input type="text" id="name" placeholder="Name" />
          <button type="submit">Query</button>
        </form>
      </div>

      <div>
        <form
          onSubmit={async (e: React.FormEvent<UserFormElement>) => {
            e.preventDefault();
            const id = e.currentTarget.elements.id.value;
            const name = e.currentTarget.elements.name.value;
            const email = e.currentTarget.elements.email.value;
            await setUser(db, id, {
              name,
              email,
            });
          }}
        >
          <p>Set User</p>
          <input type="text" id="id" placeholder="ID" />
          <input type="text" id="name" placeholder="Name" />
          <input type="email" id="email" placeholder="Email" />
          <button type="submit">Set</button>
        </form>
      </div>
    </>
  );
}

export default App;
