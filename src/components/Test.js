<table>
            <thead>
              <tr>
                <th>PC</th>
                <th>Constituency</th>
                <th>Ward</th>
                <th>Intervention Type</th>
                <th>Intervention Issues</th>
                <th>Intervention Issue Brief</th>
                <th>Department</th>
                <th>Suggested Actionable</th>
                <th>Facilitator Number</th>
                <th>Facilitator Name</th>
                <th>Leader Number</th>
                <th>Leader Name</th>
                <th>Category</th>
                <th>Date</th>
                <th>Intervention Action</th>
              </tr>
            </thead>
            <tbody>
              {interventionData.map((data, index) => {
                const getBackgroundColor = (action) => {
                  switch (action) {
                    case "Solved":
                      return "#b6d7a8";
                    case "Not Solved":
                      return "#ea9999";
                    case "Action Taken":
                      return "#ffe599";
                    default:
                      return "transparent";
                  }
                };
                return (
                  <tr key={index}>
                    <td>{data.pc}</td>
                    <td>{data.constituency}</td>
                    <td>{data.ward}</td>
                    <td>{data.category}</td>
                    <td>{data.department || "-"}</td>
                    <td>{data.interventionType}</td>
                    <td>{data.interventionIssues}</td>
                    <td>{data.interventionIssueBrief}</td>
                    <td>{data.suggestedActionable || "-"}</td>
                    <td>{data.facilitatorName || "-"}</td>
                    <td>{data.facilitatorNumber || "-"}</td>
                    <td>{data.leaderName || "-"}</td>
                    <td>{data.leaderNumber || "-"}</td>
                    <td>{new Date(data.createdAt).toLocaleDateString()}</td>
                    <td
                      style={{
                        maxWidth: "140px",
                        backgroundColor: getBackgroundColor(
                          data.interventionAction || "Not Solved"
                        ),
                      }}
                    >
                      <select
                        value={data.interventionAction || "Not Solved"}
                        style={{ width: "140px" }}
                        onChange={(e) =>
                          handleInterventionActionChange(
                            data._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Not Solved">Not Solved</option>
                        <option value="Solved">Solved</option>
                        <option value="Action Taken">Action Taken</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>