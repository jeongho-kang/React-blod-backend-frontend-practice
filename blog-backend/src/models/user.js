
import mongoose, {Schema } from 'mongoose'
import bcrypt from 'bcrypt'

const UserSchema = new Schema({
    username : String,
    hashedPassword : String,
})
// 인스턴스 메소드를 작성할 떄는 화살표가 아닌 function을 사용하여야한다.
// 함수 내부에서 this로 접근해야 하기 떄문이다.
UserSchema.methods.setPassword = async function(password) {
    const hash = await bcrypt.hash(password,10)
    this.hashedPassword = hash;
}
UserSchema.methods.checkPassword = async function(password) {
    const result = await bcrypt.compart(password, this.hashedPassword)
    return result
}
// findByUsername은 username으로 데이터를 찾을 수 있게 해준다.
UserSchema.methods.findByUsername = function(username) {
    return this.findOne({username})
}
UserSchema.methods.serialize = function() {
    const data = this.toJSON()
    delete data.hashedPassword
    return data
}

const User = mongoose.model('User' , UserSchema);
export default User;