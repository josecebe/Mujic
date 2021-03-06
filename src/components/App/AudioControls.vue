<template>
  <v-card
    tile
    style="position: fixed; bottom: 0; width: calc(100% - 80px);"
    v-if="selectedSong"
  >
    <v-progress-linear
      color="indigo darken-4"
      :value="progress"
      striped
      class="my-0"
      height="10"
    />
    <v-list>
      <v-list-item>
        <div class="px-3 mr-3">
          <div>
            {{ currentTimeVal }}
          </div>
          <div>
            {{ totalTimeVal }}
          </div>
        </div>
        <v-list-item-content>
          <v-list-item-title>
            {{ selectedSong.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            Lorem ipsum dolor
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-spacer />
        <v-list-item-icon class="mr-10">
          <v-btn
            outlined
            icon
            :class="{ 'amber lighten-3': playingNext }"
            title="Play next song after"
            @click="playingNext = !playingNext"
            :style="playingNext ? 'border: 2px solid !important;' : null"
          >
            <v-icon small>far fa-list-alt</v-icon>
          </v-btn>
        </v-list-item-icon>
        <!-- <<  |>  >> -->
        <v-list-item-icon>
          <v-btn outlined icon @click="playNext">
            <v-icon small>fas fa-fast-backward</v-icon>
          </v-btn>
        </v-list-item-icon>
        <v-list-item-icon :class="{ 'mx-5': $vuetify.breakpoint.mdAndUp }">
          <v-btn outlined icon @click="handlePlay">
            <v-icon small>
              {{ audioState === "playing" ? "fas fa-pause" : "fas fa-play" }}
            </v-icon>
          </v-btn>
        </v-list-item-icon>
        <v-list-item-icon class="ml-0">
          <v-btn outlined icon @click="playBefore">
            <v-icon small>fas fa-fast-forward</v-icon>
          </v-btn>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { mapGetters } from "vuex";
import { Prop, Watch } from "vue-property-decorator";

import moment from "moment";
function parseSecondsToHuman(seconds: number) {
  return moment
    .utc()
    .startOf("day")
    .add({ seconds: seconds })
    .format("mm:ss");
}

@Component({
  computed: {
    ...mapGetters("folder", {
      selectedSong: "selectedSong"
    })
  }
})
export default class AudioControls extends Vue {
  selectedSong: any;

  playingNext = true;

  async playBefore() {
    await this.$store.dispatch("folder/selectSongByDiff", -1);
    this.$nextTick(() => {
      this.audio.play();
    });
  }

  async playNext() {
    await this.$store.dispatch("folder/selectSongByDiff", 1);
    this.$nextTick(() => {
      this.audio.play();
    });
  }

  audioState: "playing" | "paused" | "stoped" = "stoped";
  progress = 0;
  duration = 0;
  currentTimeVal = "00:00";
  totalTimeVal = "00:00";

  @Prop()
  audio: any;

  handlePlay() {
    if (this.audioState === "playing") {
      this.audio.pause();
    } else {
      this.audio.play();
    }
  }

  refreshProgress() {
    // console.log("refreshProgress");
    // console.log({ audio: this.audio.currentTime });
    const currentTime = this.audio.currentTime;
    const aux = (currentTime.toFixed(2) * 100) / this.duration;
    this.progress = isNaN(aux) ? 0 : aux;

    this.currentTimeVal = parseSecondsToHuman(currentTime);
  }

  refreshDuration() {
    this.duration = this.audio.duration;
    this.totalTimeVal = parseSecondsToHuman(this.duration);
  }

  handleEnded() {
    if (this.playingNext) {
      this.playNext();
    }
  }

  refreshAudioInfo() {
    // console.log("refreshAudioInfo");
    // console.log({ audio: this.audio });

    if (this.audio.paused) {
      this.audioState = "paused";
    }
    if (this.audio.ended) {
      this.audioState = "stoped";
    }
    if (!this.audio.paused && !this.audio.ended) {
      this.audioState = "playing";
    }
    this.$store.commit("audio/setAudioState", this.audioState);
  }

  @Watch("audio")
  audioListeners(newVal: HTMLAudioElement, oldVal: HTMLAudioElement) {
    // console.log({ oldVal });
    const eventsAudioState = ["play", "pause", "ended"];

    if (oldVal) {
      oldVal.pause();
      oldVal.removeEventListener("loadedmetadata", this.refreshDuration);
      oldVal.removeEventListener("timeupdate", this.refreshProgress);
      oldVal.removeEventListener("ended", this.handleEnded);
      eventsAudioState.forEach(ev => {
        oldVal.removeEventListener(ev, this.refreshAudioInfo);
      });
    }
    if (newVal) {
      newVal.addEventListener("loadedmetadata", this.refreshDuration);
      newVal.addEventListener("timeupdate", this.refreshProgress);
      newVal.addEventListener("ended", this.handleEnded);
      eventsAudioState.forEach(ev => {
        newVal.addEventListener(ev, this.refreshAudioInfo);
      });
    }
    this.refreshProgress();
    this.refreshAudioInfo();
  }
}
</script>

<style></style>
