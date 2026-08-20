import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
  NgZone,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

interface ParticleData {
  t: number;
  factor: number;
  speed: number;
  xFactor: number;
  yFactor: number;
  zFactor: number;
  mx: number;
  my: number;
  mz: number;
  cx: number;
  cy: number;
  cz: number;
  vx: number;
  vy: number;
  vz: number;
  randomRadiusOffset: number;
}

@Component({
  selector: 'app-antigravity',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #container class="antigravity-container">
      <canvas #canvas class="antigravity-canvas"></canvas>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .antigravity-container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    .antigravity-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  `]
})
export class AntigravityComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() count = 300;
  @Input() magnetRadius = 10;
  @Input() ringRadius = 10;
  @Input() waveSpeed = 0.4;
  @Input() waveAmplitude = 1;
  @Input() particleSize = 2;
  @Input() lerpSpeed = 0.1;
  @Input() color = '#643951';
  @Input() autoAnimate = true;
  @Input() particleVariance = 1;
  @Input() rotationSpeed = 0;
  @Input() depthFactor = 1;
  @Input() pulseSpeed = 3;
  @Input() particleShape: 'capsule' | 'sphere' | 'box' | 'tetrahedron' = 'capsule';
  @Input() fieldStrength = 10;

  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly ngZone = inject(NgZone);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private mesh!: THREE.InstancedMesh;
  private geometry!: THREE.BufferGeometry;
  private material!: THREE.MeshBasicMaterial;
  private dummy = new THREE.Object3D();

  private particles: ParticleData[] = [];
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private lastMousePos = { x: 0, y: 0 };
  private lastMouseMoveTime = 0;
  private virtualMouse = { x: 0, y: 0 };
  private pointer = { x: 0, y: 0 };
  private clock = new THREE.Clock();

  private viewport = { width: 100, height: 100 };
  private mouseMoveHandler = (e: MouseEvent | TouchEvent) => this.onPointerMove(e);

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initThree();
      this.initParticles();
      this.setupEventListeners();
      this.animate();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mesh) return;

    if (changes['count'] || changes['particleShape']) {
      this.recreateMesh();
    } else if (changes['color'] && this.material) {
      this.material.color.set(this.color);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('touchmove', this.mouseMoveHandler);

    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }

  private initThree(): void {
    const container = this.containerRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 50);

    this.updateViewportSize(width, height);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.buildMesh();
  }

  private updateViewportSize(width: number, height: number): void {
    const fovRad = THREE.MathUtils.degToRad(35 / 2);
    const vHeight = 2 * Math.tan(fovRad) * 50;
    const vWidth = vHeight * (width / height);
    this.viewport = { width: vWidth, height: vHeight };
  }

  private createGeometry(): THREE.BufferGeometry {
    switch (this.particleShape) {
      case 'sphere':
        return new THREE.SphereGeometry(0.2, 16, 16);
      case 'box':
        return new THREE.BoxGeometry(0.3, 0.3, 0.3);
      case 'tetrahedron':
        return new THREE.TetrahedronGeometry(0.3);
      case 'capsule':
      default:
        return new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
    }
  }

  private buildMesh(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      if (this.geometry) this.geometry.dispose();
      if (this.material) this.material.dispose();
    }

    this.geometry = this.createGeometry();
    this.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.color),
      transparent: true,
      opacity: 0.85
    });

    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.mesh);
  }

  private recreateMesh(): void {
    this.buildMesh();
    this.initParticles();
  }

  private initParticles(): void {
    this.particles = [];
    const width = this.viewport.width || 100;
    const height = this.viewport.height || 100;

    for (let i = 0; i < this.count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;

      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 20;

      const randomRadiusOffset = (Math.random() - 0.5) * 2;

      this.particles.push({
        t,
        factor,
        speed,
        xFactor,
        yFactor,
        zFactor,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        vx: 0,
        vy: 0,
        vz: 0,
        randomRadiusOffset
      });
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
    window.addEventListener('touchmove', this.mouseMoveHandler, { passive: true });

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.onResize(width, height);
        }
      }
    });
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  private onPointerMove(e: MouseEvent | TouchEvent): void {
    let clientX = 0;
    let clientY = 0;

    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.pointer.x = (x / w) * 2 - 1;
    this.pointer.y = -(y / h) * 2 + 1;
  }

  private onResize(width: number, height: number): void {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.updateViewportSize(width, height);
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (!this.mesh) return;

    const v = this.viewport;
    const m = this.pointer;

    const mouseDist = Math.sqrt(
      Math.pow(m.x - this.lastMousePos.x, 2) + Math.pow(m.y - this.lastMousePos.y, 2)
    );

    if (mouseDist > 0.001) {
      this.lastMouseMoveTime = Date.now();
      this.lastMousePos = { x: m.x, y: m.y };
    }

    let destX = (m.x * v.width) / 2;
    let destY = (m.y * v.height) / 2;

    const elapsedTime = this.clock.getElapsedTime();

    if (this.autoAnimate && Date.now() - this.lastMouseMoveTime > 2000) {
      destX = Math.sin(elapsedTime * 0.5) * (v.width / 4);
      destY = Math.cos(elapsedTime * 0.5 * 2) * (v.height / 4);
    }

    const smoothFactor = 0.05;
    this.virtualMouse.x += (destX - this.virtualMouse.x) * smoothFactor;
    this.virtualMouse.y += (destY - this.virtualMouse.y) * smoothFactor;

    const targetX = this.virtualMouse.x;
    const targetY = this.virtualMouse.y;

    const globalRotation = elapsedTime * this.rotationSpeed;

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      let { speed, mx, my, mz, cz, randomRadiusOffset } = particle;

      particle.t += speed / 2;
      const t = particle.t;

      const projectionFactor = 1 - cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;

      const dx = mx - projectedTargetX;
      const dy = my - projectedTargetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const targetPos = { x: mx, y: my, z: mz * this.depthFactor };

      if (dist < this.magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(t * this.waveSpeed + angle) * (0.5 * this.waveAmplitude);
        const deviation = randomRadiusOffset * (5 / (this.fieldStrength + 0.1));

        const currentRingRadius = this.ringRadius + wave + deviation;

        targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
        targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
        targetPos.z = mz * this.depthFactor + Math.sin(t) * (1 * this.waveAmplitude * this.depthFactor);
      }

      particle.cx += (targetPos.x - particle.cx) * this.lerpSpeed;
      particle.cy += (targetPos.y - particle.cy) * this.lerpSpeed;
      particle.cz += (targetPos.z - particle.cz) * this.lerpSpeed;

      this.dummy.position.set(particle.cx, particle.cy, particle.cz);
      this.dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz);
      this.dummy.rotateX(Math.PI / 2);

      const currentDistToMouse = Math.sqrt(
        Math.pow(particle.cx - projectedTargetX, 2) + Math.pow(particle.cy - projectedTargetY, 2)
      );

      const distFromRing = Math.abs(currentDistToMouse - this.ringRadius);
      let scaleFactor = 1 - distFromRing / 10;
      scaleFactor = Math.max(0, Math.min(1, scaleFactor));

      const finalScale =
        scaleFactor *
        (0.8 + Math.sin(t * this.pulseSpeed) * 0.2 * this.particleVariance) *
        this.particleSize;

      this.dummy.scale.set(finalScale, finalScale, finalScale);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  };
}
