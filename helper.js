var config = require('./config');
var ago = require('s-ago');

module.exports = {

    getVisitorId: (visitorId) => {
        return visitorId;
    },

    getAllScraps : () => {
        return new Promise((resolve, reject) => {
            config.ScrapData.orderByChild("status").equalTo(1).once('value', (snapshot) => {
                resolve(snapshot.val());
                reject(new Error('Error while fetching Scrap Data'));
            });
        })
    },

    getScrapById : (id) => {
        return new Promise((resolve, reject) => {
            config.ScrapData.child(id).once('value', (snapshot) => {
                resolve(snapshot.val());
                reject(new Error('Scrap Data not found'));
            });
        })
    },

    decideAttachmentType : (x) => {
        return new Promise((resolve, reject) => {
            x.ago = ago(new Date(x.createdAt));
            if (x.attachment.type == 'png' || x.attachment.type == 'jpg' || x.attachment.type == 'jpeg' || x.attachment.type == 'gif') {
                x.isImage = true;
            } else if (x.attachment.type == 'mp4') {
                x.isVideo = true;
            }

            // check if x.content has any url, then return the url
            if (x.content.match(/\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/g)) {
                x.url = x.content.match(/\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/g)[0];
            }
            // console.log(x.url);
            resolve(x);
            reject(new Error('Error while deciding attachment type'));
        })
    },

    postScrapLikesCounter : (scrap) => {
        return new Promise( async (resolve, reject) => {

            await config.ScrapData.child(scrap.id).child('likes').once('value', async (snapshot) => {
                var likes = snapshot.val();
                if (likes) {
                    for (var key in likes) {
                        var likesArray = Object.keys(likes).map((key) => {
                            return likes[key];
                        })
                    }

                    if (likesArray.includes(scrap.visitorId)) {
                        await config.ScrapData.child(scrap.id).child('likes').child(key).remove();
                    } else {
                        await config.ScrapData.child(scrap.id).child('likes').push(scrap.visitorId);
                    }
                    
                } else {
                    await config.ScrapData.child(scrap.id).child('likes').push(scrap.visitorId);
                }
            }).catch((err) => {
                reject(err);
            })
        })
    }

}