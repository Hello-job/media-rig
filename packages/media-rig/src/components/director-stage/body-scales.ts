import type { DirectorBodyType as DirectorCharacterBodyType } from "./DirectorStage.types";
type Ue4BoneScaleMap = Record<string, [number, number, number]>;
function baseBoneScales(): Ue4BoneScaleMap {
  return {
    Bip001_Head_055: [1, 1, 1],
    Bip001_Neck_06: [1, 1, 1],
    Bip001_Pelvis_03: [1, 1, 1],
    Bip001_Spine_04: [1, 1, 1],
    Bip001_Spine1_05: [1, 1.02, 1.02],
    Bip001_L_Clavicle_07: [1, 1, 1],
    Bip001_R_Clavicle_031: [1, 1, 1],
    Bip001_L_UpperArm_08: [1, 1, 1],
    Bip001_R_UpperArm_032: [1, 1, 1],
    Bip001_L_Forearm_09: [1, 1, 1],
    Bip001_R_Forearm_033: [1, 1, 1],
    Bip001_L_Hand_010: [1, 1, 1],
    Bip001_R_Hand_034: [1, 1, 1],
    Bip001_L_Thigh_057: [1, 1, 1],
    Bip001_R_Thigh_061: [1, 1, 1],
    Bip001_L_Calf_058: [1, 1, 1],
    Bip001_R_Calf_062: [1, 1, 1],
    Bip001_L_Foot_059: [1, 1, 1],
    Bip001_R_Foot_063: [1, 1, 1],
  };
}

export function getUe4ModelScale(
  bodyType?: DirectorCharacterBodyType,
): [number, number, number] {
  switch (bodyType) {
    case "teen":
      return [0.88, 0.88, 0.88];
    case "child":
      return [0.72, 0.72, 0.72];
    case "chibi":
      return [0.56, 0.56, 0.56];
    default:
      return [1, 1, 1];
  }
}

export function getUe4BodyBoneScales(
  bodyType: DirectorCharacterBodyType = "mannequin",
): Ue4BoneScaleMap {
  const scales = baseBoneScales();

  switch (bodyType) {
    case "female":
      scales.Bip001_Pelvis_03 = [1, 1.04, 1.04];
      scales.Bip001_Spine_04 = [0.98, 0.9, 0.94];
      scales.Bip001_Spine1_05 = [0.98, 1, 1];
      scales.Bip001_L_Clavicle_07 = [0.92, 1, 1];
      scales.Bip001_R_Clavicle_031 = [0.92, 1, 1];
      scales.Bip001_L_UpperArm_08 = [0.9, 0.9, 0.9];
      scales.Bip001_R_UpperArm_032 = [0.9, 0.9, 0.9];
      scales.Bip001_L_Forearm_09 = [1, 0.88, 0.9];
      scales.Bip001_R_Forearm_033 = [1, 0.88, 0.9];
      scales.Bip001_L_Thigh_057 = [1, 0.96, 0.96];
      scales.Bip001_R_Thigh_061 = [1, 0.96, 0.96];
      break;
    case "broad":
      scales.Bip001_Pelvis_03 = [1.02, 1.12, 1.08];
      scales.Bip001_Spine1_05 = [1.02, 1.22, 1.1];
      scales.Bip001_L_Clavicle_07 = [1.12, 1, 1];
      scales.Bip001_R_Clavicle_031 = [1.12, 1, 1];
      scales.Bip001_L_UpperArm_08 = [1, 1.12, 1.12];
      scales.Bip001_R_UpperArm_032 = [1, 1.12, 1.12];
      scales.Bip001_L_Forearm_09 = [1, 1.08, 1.08];
      scales.Bip001_R_Forearm_033 = [1, 1.08, 1.08];
      scales.Bip001_L_Thigh_057 = [1.02, 1.1, 1.08];
      scales.Bip001_R_Thigh_061 = [1.02, 1.1, 1.08];
      break;
    case "muscular":
      scales.Bip001_Pelvis_03 = [1, 1.04, 1.04];
      scales.Bip001_Spine_04 = [1.02, 1.1, 1.06];
      scales.Bip001_Spine1_05 = [1.02, 1.26, 1.1];
      scales.Bip001_L_Clavicle_07 = [1.16, 1, 1];
      scales.Bip001_R_Clavicle_031 = [1.16, 1, 1];
      scales.Bip001_L_UpperArm_08 = [1, 1.18, 1.18];
      scales.Bip001_R_UpperArm_032 = [1, 1.18, 1.18];
      scales.Bip001_L_Forearm_09 = [1, 1.12, 1.12];
      scales.Bip001_R_Forearm_033 = [1, 1.12, 1.12];
      scales.Bip001_L_Thigh_057 = [1, 1.12, 1.12];
      scales.Bip001_R_Thigh_061 = [1, 1.12, 1.12];
      break;
    case "slim":
      scales.Bip001_Pelvis_03 = [0.98, 0.75, 0.9];
      scales.Bip001_Spine_04 = [0.98, 1, 1];
      scales.Bip001_Spine1_05 = [0.98, 1, 1];
      scales.Bip001_L_Clavicle_07 = [0.9, 1, 0.9];
      scales.Bip001_R_Clavicle_031 = [0.9, 1, 0.9];
      scales.Bip001_L_UpperArm_08 = [0.96, 0.96, 0.96];
      scales.Bip001_R_UpperArm_032 = [0.96, 0.96, 0.96];
      scales.Bip001_L_Forearm_09 = [1, 1, 0.78];
      scales.Bip001_R_Forearm_033 = [1, 1, 0.78];
      scales.Bip001_L_Thigh_057 = [1, 0.84, 0.84];
      scales.Bip001_R_Thigh_061 = [1, 0.84, 0.84];
      break;
    case "teen":
      scales.Bip001_Head_055 = [1.12, 1.12, 1.12];
      scales.Bip001_Pelvis_03 = [0.96, 0.94, 0.94];
      scales.Bip001_Spine1_05 = [0.96, 0.94, 0.94];
      scales.Bip001_L_UpperArm_08 = [0.96, 0.9, 0.9];
      scales.Bip001_R_UpperArm_032 = [0.96, 0.9, 0.9];
      scales.Bip001_L_Thigh_057 = [0.96, 0.9, 0.9];
      scales.Bip001_R_Thigh_061 = [0.96, 0.9, 0.9];
      break;
    case "child":
      scales.Bip001_Head_055 = [1.34, 1.34, 1.34];
      scales.Bip001_Pelvis_03 = [0.88, 0.9, 0.9];
      scales.Bip001_Spine_04 = [1.2, 1.2, 1.2];
      scales.Bip001_Spine1_05 = [0.84, 0.86, 0.86];
      scales.Bip001_L_UpperArm_08 = [0.84, 1.1, 1.1];
      scales.Bip001_R_UpperArm_032 = [0.84, 1.1, 1.1];
      scales.Bip001_L_Forearm_09 = [1, 0.8, 0.8];
      scales.Bip001_R_Forearm_033 = [1, 0.8, 0.8];
      scales.Bip001_L_Thigh_057 = [0.7, 0.9, 0.9];
      scales.Bip001_R_Thigh_061 = [0.7, 0.9, 0.9];
      scales.Bip001_L_Calf_058 = [0.82, 0.9, 0.9];
      scales.Bip001_R_Calf_062 = [0.82, 0.9, 0.9];
      break;
    case "chibi":
      scales.Bip001_Head_055 = [4, 4, 4];
      scales.Bip001_Neck_06 = [0.72, 0.76, 0.76];
      scales.Bip001_Pelvis_03 = [0.92, 1.22, 1.22];
      scales.Bip001_Spine_04 = [0.68, 1, 1];
      scales.Bip001_Spine1_05 = [1, 0.9, 0.9];
      scales.Bip001_L_Clavicle_07 = [1.24, 0.9, 0.9];
      scales.Bip001_R_Clavicle_031 = [1.24, 0.9, 0.9];
      scales.Bip001_L_UpperArm_08 = [1.2, 1.3, 1.3];
      scales.Bip001_R_UpperArm_032 = [1.2, 1.3, 1.3];
      scales.Bip001_L_Forearm_09 = [0.7, 1, 1];
      scales.Bip001_R_Forearm_033 = [0.7, 1, 1];
      scales.Bip001_L_Hand_010 = [1.45, 1, 1];
      scales.Bip001_R_Hand_034 = [1.45, 1, 1];
      scales.Bip001_L_Thigh_057 = [0.62, 0.8, 0.8];
      scales.Bip001_R_Thigh_061 = [0.62, 0.8, 0.8];
      scales.Bip001_L_Calf_058 = [0.7, 0.9, 0.9];
      scales.Bip001_R_Calf_062 = [0.7, 0.9, 0.9];
      scales.Bip001_L_Foot_059 = [1.06, 0.82, 1.16];
      scales.Bip001_R_Foot_063 = [1.06, 0.82, 1.16];
      break;
    default:
      scales.Bip001_Pelvis_03 = [1, 1.02, 1.02];
      scales.Bip001_Spine1_05 = [1, 1.02, 1.02];
      break;
  }

  return scales;
}

