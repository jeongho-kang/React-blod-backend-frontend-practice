import Post from './models/post.js'

export default function createFakeData() {
    // 0,1, 39로 이루어진 배열을 생성한 후 포스트 데이터로 변환
    const posts = [...Array(40).keys()].map(i=> ({
        title: `포스트 #${i}`,
        // https://www.lipsum.com 에서 복사한 200자 이상의 텍스트
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam metus risus, pretium at suscipit a, pellentesque vitae sapien. Suspendisse efficitur elementum enim sed gravida. Praesent imperdiet viverra ex blandit ornare. Duis posuere velit in ultrices lacinia. Ut sed ante vitae augue tincidunt sagittis. Duis in sodales dolor. Ut aliquet nec quam eget faucibus. Sed rutrum nisl quam. Morbi molestie sem nisi, vitae euismod eros vestibulum interdum. Pellentesque eros turpis, pulvinar quis lectus efficitur, aliquet sodales diam.',
        tags: ['가짜','데이터']
    }))
    Post.insertMany(posts, (err,docs) => {
        console.log(docs)
    })
}