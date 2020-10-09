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
        this.isEnableDisplay = false;
        this.size = 0;
        this.speed_value = 0;
        this.group = null;
    }

    setResource = (res) => {
        const { url = "", num = 5000, range = 500,
            color = 0xffffff, sizeAttenuation = true, size = 0, speed_value = 0 } = res;
        this.url = url;
        this.num = num;
        this.range = range;
        this.color = color;
        this.sizeAttenuation = sizeAttenuation;
        this.size = size;
        this.speed_value = speed_value;
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
            if(this.speed_value == 0) {
                sprite.velocityY = 0.1 + Math.random() / 5;
                sprite.velocityX = (Math.random() - 0.5) / 3;
                sprite.velocityZ = (Math.random() - 0.5) / 3;
            }
            else if(this.speed_value == 1) {
                sprite.velocityY = 0.4 + Math.random() / 2;
                sprite.velocityX = 0.2 + (Math.random() - 1.4) / 3;
                sprite.velocityZ = 0.2 + (Math.random() - 1.4) / 3;
            }
            else if(this.speed_value == 2) {
                sprite.velocityY = 0.7 + Math.random() ;
                sprite.velocityX = 0.3 + (Math.random() - 1.7) / 3;
                sprite.velocityZ = 0.3 + (Math.random() - 1.7) / 3;
            }

            //sprite.velocityX = (Math.random() - 0.5) /20;

            if(this.size == 0)
                sprite.scale.set(2,2,2);
            else if(this.size == 1)
                sprite.scale.set(6,6,6);
            else
                sprite.scale.set(12,12,12);
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