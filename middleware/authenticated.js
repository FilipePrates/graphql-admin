export default function ({ store, redirect }) {
  // If the user is not authenticated]
  console.log("midleware", store);
  const token = localStorage.getItem("apollo-token");
  if (token == null) {
    return redirect("/login");
  }
}
