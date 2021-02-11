const users = []

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error: 'Username is taken'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((u) => {
        return u.id === id
    })
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUserInRoom = (room) => {
    return users.filter((u) => {
       return u.room === room.toLowerCase().trim()
    })
}

module.exports = {addUser, removeUser, getUser, getUserInRoom}