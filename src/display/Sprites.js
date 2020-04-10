import * as THREE from 'three';

class Sprites {

    /**
     * scene:   当前场景
     * url:     贴图文件地址
     * num:     粒子个数
     * range:   粒子所处范围，范围为立方体，range为立方体边长，立方体中心为(0,0,0)
     * color:   粒子颜色
     * sizeAttenuation: 是否随摄像机远近调整大小，true随远近缩放
     */
    constructor(scene, url, num, range, color, sizeAttenuation) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.range = range;

        var textureLoader = new THREE.TextureLoader();
        var spriteMap = textureLoader.load(url);
        var spriteMaterial = new THREE.SpriteMaterial({
            map: spriteMap,
            color: color,
            sizeAttenuation: sizeAttenuation,
            blending: THREE.AdditiveBlending,
            depthTest: false,
        })

        for (var i = 0; i < num; i++) {
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.x = Math.random() * range - range / 2;
            sprite.y = Math.random() * range - range / 2;
            sprite.z = Math.random() * range - range / 2;
            sprite.position.set(sprite.x, sprite.y, sprite.z);
            sprite.velocityY = 0.1 + Math.random() / 5;
            sprite.velocityX = (Math.random() - 0.5) / 3;
            sprite.velocityZ = (Math.random() - 0.5) / 3;
            this.group.add(sprite);
        }

        this.scene.add(this.group);
    }

    update = () => {
        var range = this.range;
        this.group.children.forEach(function (u) {
            u.y = u.y - u.velocityY;
            u.x = u.x - u.velocityX;
            u.z = u.z - u.velocityZ;

            if (u.y <= -range / 2) u.y = range;
            if (u.x <= -range / 2 || u.x >= range / 2) u.velocityX = u.velocityX * -1;
            if (u.z <= -range / 2 || u.z >= range / 2) u.velocityZ = u.velocityZ * -1;

            u.position.set(u.x, u.y, u.z);
        });
    }
}

export default Sprites;