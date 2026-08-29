import type { User } from "../App";

function Group({ children, index }: { children: User[]; index: number }) {
  // console.log(children)
  return (
    <div className='group-container'>
      <h2 style={{color: "var(--primary-accent-color)"}}>Gruppe {index+1}</h2>
        <ul>
          {children.map((member: User) => <li key={member.id}>{member.vorname} {member.nachname}</li>)}
        </ul>
    </div>
  )
}

export default Group
