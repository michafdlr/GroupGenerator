import type { User } from "../App"
import { useRef } from "react"
import Draggable from 'react-draggable'

function Group({ children, index }: { children: User[]; index: number }) {
  // console.log(children)
  const nodeRef = useRef(null)
  return (
    <div className='group-container'>
      <h2 style={{color: "var(--primary-accent-color)"}}>Gruppe {index+1}</h2>
        <ul>
          {children.map((member: User) =>
            <Draggable key={member.id} nodeRef={nodeRef}>
              <li ref={nodeRef}>{member.vorname} {member.nachname}</li>
            </Draggable>
          )}
        </ul>
    </div>
  )
}

export default Group
