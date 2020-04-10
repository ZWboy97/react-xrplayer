import * as THREE from 'three';

/**
 * 例子特效展示
 */
class SpriteParticleHelper {

    /**
     * scene:   当前场景
     * url:     贴图文件地址
     * num:     粒子个数
     * range:   粒子所处范围，范围为立方体，range为立方体边长，立方体中心为(0,0,0)
     * color:   粒子颜色
     * sizeAttenuation: 是否随摄像机远近调整大小，true随远近缩放
     */
    constructor(scene) {
        this.scene = scene;
        this.url = null;
        this.num = 5000;
        this.range = 500;
        this.color = 0xffffff;
        this.sizeAtEtenuation = true;
        this.isEnableDisplay = false

        this.group = null;
    }

    setResource = (res) => {
        const { url = "", num = 5000, range = 500,
            color = 0xffffff, sizeAttenuation = true } = res;
        this.url = url;
        this.num = num;
        this.range = range;
        this.color = color;
        this.sizeAttenuation = sizeAttenuation;
        this.initGroup();
    }

    initGroup = () => {
        if (this.group) {
            this.scene.remove(this.group);
        }
        this.group = new THREE.Group();
        var textureLoader = new THREE.TextureLoader();
        var spriteMap = textureLoader.load(this.url);
        var spriteMaterial = new THREE.SpriteMaterial({
            map: spriteMap,
            color: this.color,
            sizeAttenuation: this.sizeAttenuation,
            blending: THREE.AdditiveBlending,
            depthTest: false,
        })
        for (var i = 0; i < this.num; i++) {
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.x = Math.random() * this.range - this.range / 2;
            sprite.y = Math.random() * this.range - this.range / 2;
            sprite.z = Math.random() * this.range - this.range / 2;
            sprite.position.set(sprite.x, sprite.y, sprite.z);
            sprite.velocityY = 0.1 + Math.random() / 5;
            sprite.velocityX = (Math.random() - 0.5) / 3;
            sprite.velocityZ = (Math.random() - 0.5) / 3;
            this.group.add(sprite);
        }
    }

    getEnableDisplay = () => {
        return this.isEnableDisplay;
    }

    enableDisplay = () => {
        if (this.group) {
            this.scene.add(this.group);
            this.isEnableDisplay = true;
        }
    }

    disableDisplay = () => {
        if (this.group) {
            this.scene.remove(this.group);
            this.isEnableDisplay = false;
        }
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

export default SpriteParticleHelper;