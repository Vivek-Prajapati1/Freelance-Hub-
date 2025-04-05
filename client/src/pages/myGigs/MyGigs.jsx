import React from "react";
import { Link } from "react-router-dom";
import "./myGigs.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MyGigs() {
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();
  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () =>
      newRequest.get(`/gigs?userId=${currentUser._id}`).then((res) => {
        return res.data;
      }),
  });
  
  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/gigs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  const handleDelete = async (id) => {
    try {
      await mutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="myGigs">
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">Error: {error.message}</div>
      ) : (
        <div className="container">
          <div className="title">
            <h1>Gigs</h1>
            {currentUser.isSeller && (
              <Link to="/add">
                <button>Add New Gig</button>
              </Link>
            )}
          </div>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Sales</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((gig) => (
                <tr key={gig._id}>
                  <td>
                    <img className="image" src={gig.cover} alt="" />
                  </td>
                  <td>{gig.title}</td>
                  <td> &#x20B9;{gig.price}</td>
                  <td>{gig.sales}</td>
                  <td className="action">
                    <Link to={`/edit-gig/${gig._id}`} className="edit">
                      <img src="/images/edit.png" alt="Edit" />
                    </Link>
                    {/* <img
                      className="delete"
                      src="/images/delete.png"
                      alt="Delete"
                      onClick={() => handleDelete(gig._id)}
                    /> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyGigs;